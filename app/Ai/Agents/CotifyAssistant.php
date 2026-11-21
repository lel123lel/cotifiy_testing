<?php

namespace App\Ai\Agents;

use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Promptable;
use Stringable;

class CotifyAssistant implements Agent
{
    use Promptable;

    public function instructions(): Stringable|string
    {
        return 'You are Cotify Assistant, a helpful guide for the Cotify student portal. Be concise, friendly, and clear. Help users understand how to use the portal. You do not have access to live announcements, account data, or campus records; do not invent them, and direct users to the relevant portal page for current information.';
    }
}
