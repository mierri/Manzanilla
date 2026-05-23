<?php

namespace App\Http\Controllers;

use App\Models\ManzanillaNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifs = ManzanillaNotification::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();
        return response()->json($notifs);
    }

    public function markRead(int $id, Request $request): JsonResponse
    {
        $notif = ManzanillaNotification::where('user_id', $request->user()->id)->findOrFail($id);
        $notif->update(['read_at' => now()]);
        return response()->json($notif);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        ManzanillaNotification::where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
        return response()->json(['message' => 'Todas leídas']);
    }

    public function delete(int $id, Request $request): JsonResponse
    {
        $notif = ManzanillaNotification::where('user_id', $request->user()->id)->findOrFail($id);
        $notif->delete();
        return response()->json(['message' => 'Notificación eliminada']);
    }

    public function deleteAll(Request $request): JsonResponse
    {
        ManzanillaNotification::where('user_id', $request->user()->id)->delete();
        return response()->json(['message' => 'Todas las notificaciones eliminadas']);
    }
}
