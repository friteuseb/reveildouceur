<?php
/**
 * Classe Mailer - Envoi d'emails via SMTP
 * Implémentation légère sans dépendances externes
 */

class Mailer {
    private $host;
    private $port;
    private $username;
    private $password;
    private $encryption;
    private $fromEmail;
    private $fromName;
    private $socket;
    private $lastError = '';

    public function __construct(array $config) {
        $this->host = $config['host'] ?? 'localhost';
        $this->port = $config['port'] ?? 587;
        $this->username = $config['username'] ?? '';
        $this->password = $config['password'] ?? '';
        $this->encryption = $config['encryption'] ?? 'tls';
        $this->fromEmail = $config['from_email'] ?? $config['username'];
        $this->fromName = $config['from_name'] ?? '';
    }

    public function getLastError(): string {
        return $this->lastError;
    }

    public function send(string $toEmail, string $toName, string $subject, string $body): bool {
        try {
            // Connexion au serveur SMTP
            $this->socket = @fsockopen(
                $this->encryption === 'ssl' ? "ssl://{$this->host}" : $this->host,
                $this->port,
                $errno,
                $errstr,
                30
            );

            if (!$this->socket) {
                $this->lastError = "Connexion impossible: $errstr ($errno)";
                return false;
            }

            // Lecture de la réponse initiale
            $this->getResponse();

            // EHLO
            $this->sendCommand("EHLO " . gethostname());

            // STARTTLS si nécessaire
            if ($this->encryption === 'tls') {
                $this->sendCommand("STARTTLS");
                if (!stream_socket_enable_crypto($this->socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                    $this->lastError = "Impossible d'activer TLS";
                    return false;
                }
                $this->sendCommand("EHLO " . gethostname());
            }

            // Authentification
            $this->sendCommand("AUTH LOGIN");
            $this->sendCommand(base64_encode($this->username));
            $this->sendCommand(base64_encode($this->password));

            // Expéditeur et destinataire
            $this->sendCommand("MAIL FROM:<{$this->fromEmail}>");
            $this->sendCommand("RCPT TO:<{$toEmail}>");

            // Données du message
            $this->sendCommand("DATA");

            // En-têtes et corps
            $headers = $this->buildHeaders($toEmail, $toName, $subject);
            $message = $headers . "\r\n" . $body . "\r\n.";
            $this->sendCommand($message, false);

            // Fin
            $this->sendCommand("QUIT");

            fclose($this->socket);
            return true;

        } catch (Exception $e) {
            $this->lastError = $e->getMessage();
            if ($this->socket) {
                fclose($this->socket);
            }
            return false;
        }
    }

    private function sendCommand(string $command, bool $expectResponse = true): string {
        fwrite($this->socket, $command . "\r\n");

        if ($expectResponse) {
            $response = $this->getResponse();
            $code = substr($response, 0, 3);

            // Codes d'erreur SMTP
            if ($code[0] === '4' || $code[0] === '5') {
                throw new Exception("Erreur SMTP: $response");
            }

            return $response;
        }

        return '';
    }

    private function getResponse(): string {
        $response = '';
        while ($line = fgets($this->socket, 515)) {
            $response .= $line;
            // Si le 4ème caractère est un espace, c'est la dernière ligne
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }
        return $response;
    }

    private function buildHeaders(string $toEmail, string $toName, string $subject): string {
        $fromHeader = $this->fromName
            ? "=?UTF-8?B?" . base64_encode($this->fromName) . "?= <{$this->fromEmail}>"
            : $this->fromEmail;

        $toHeader = $toName
            ? "=?UTF-8?B?" . base64_encode($toName) . "?= <{$toEmail}>"
            : $toEmail;

        $headers = [
            "MIME-Version: 1.0",
            "Content-Type: text/plain; charset=UTF-8",
            "Content-Transfer-Encoding: 8bit",
            "From: $fromHeader",
            "To: $toHeader",
            "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=",
            "Date: " . date('r'),
            "Message-ID: <" . uniqid() . "@reveildouceur.fr>",
            "X-Mailer: ReveilDouceur/1.0",
        ];

        return implode("\r\n", $headers) . "\r\n";
    }
}
