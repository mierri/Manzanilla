<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;

class PushSubscription extends Model
{
    protected $fillable = ['user_id', 'endpoint', 'public_key', 'auth_token'];

    public static function sendToUser(int $userId, array $payload): void
    {
        $subscriptions = self::where('user_id', $userId)->get();
        if ($subscriptions->isEmpty()) return;

        $auth = [
            'VAPID' => [
                'subject'    => 'mailto:' . config('app.vapid_contact', 'admin@manzanilla.mx'),
                'publicKey'  => config('app.vapid_public_key'),
                'privateKey' => config('app.vapid_private_key'),
            ],
        ];

        $webPush = new WebPush($auth);
        $json    = json_encode($payload);

        foreach ($subscriptions as $sub) {
            $webPush->queueNotification(
                Subscription::create([
                    'endpoint'        => $sub->endpoint,
                    'publicKey'       => $sub->public_key,
                    'authToken'       => $sub->auth_token,
                    'contentEncoding' => 'aesgcm',
                ]),
                $json
            );
        }

        foreach ($webPush->flush() as $report) {
            if (!$report->isSuccess()) {
                Log::warning("Push failed for endpoint {$report->getEndpoint()}: " . $report->getReason());
                // Remove expired/invalid subscriptions
                if ($report->isSubscriptionExpired()) {
                    self::where('endpoint', $report->getEndpoint())->delete();
                }
            }
        }
    }
}
