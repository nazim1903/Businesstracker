<?php

namespace Config;

use CodeIgniter\Config\BaseConfig;

class App extends BaseConfig
{
    public $baseURL = 'http://your-domain.com/';
    public $indexPage = '';
    public $uriProtocol = 'REQUEST_URI';
    public $defaultLocale = 'en';
    public $negotiateLocale = false;
    public $supportedLocales = ['en'];
    public $appTimezone = 'UTC';
    public $charset = 'UTF-8';
    public $forceGlobalSecureRequests = false;

    public $sessionDriver = 'CodeIgniter\Session\Handlers\FileHandler';
    public $sessionCookieName = 'ci_session';
    public $sessionExpiration = 7200;
    public $sessionSavePath = WRITEPATH . 'session';
    public $sessionMatchIP = false;
    public $sessionTimeToUpdate = 300;
    public $sessionRegenerateDestroy = false;

    public $cookiePrefix = '';
    public $cookieDomain = '';
    public $cookiePath = '/';
    public $cookieSecure = false;
    public $cookieHTTPOnly = true;
    public $cookieSameSite = 'Lax';

    public $proxyIPs = '';
}