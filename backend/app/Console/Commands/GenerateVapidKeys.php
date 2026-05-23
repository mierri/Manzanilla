<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Minishlink\WebPush\VAPID;

class GenerateVapidKeys extends Command
{
    protected $signature   = 'vapid:generate';
    protected $description = 'Generate VAPID keys for Web Push and write them to .env';

    public function handle(): void
    {
        $keys = VAPID::createVapidKeys();

        $this->info('Generated VAPID keys:');
        $this->line('');
        $this->line('VAPID_PUBLIC_KEY='  . $keys['publicKey']);
        $this->line('VAPID_PRIVATE_KEY=' . $keys['privateKey']);
        $this->line('');

        $envPath = base_path('.env');
        if (!file_exists($envPath)) {
            $this->error('.env file not found');
            return;
        }

        $env = file_get_contents($envPath);

        foreach (['PUBLIC' => $keys['publicKey'], 'PRIVATE' => $keys['privateKey']] as $suffix => $value) {
            $key = "VAPID_{$suffix}_KEY";
            if (str_contains($env, "{$key}=")) {
                $env = preg_replace("/^{$key}=.*/m", "{$key}={$value}", $env);
            } else {
                $env .= "\n{$key}={$value}";
            }
        }

        file_put_contents($envPath, $env);
        $this->info('Keys written to .env');
        $this->line('');
        $this->warn('Add VITE_VAPID_PUBLIC_KEY=$VAPID_PUBLIC_KEY to your frontend .env as well.');
    }
}
