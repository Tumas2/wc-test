<!DOCTYPE html>
<html lang="en">
<?php
$base_url = '/swc';
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <base href="<?= $base_url; ?>/">

    <script type="importmap">
        {
            "imports": {
                "swc": "./src/index.js",
                "stores/": "./test/stores/"
            }
        }
    </script>

    <!-- <link rel="modulepreload" href="./test/components/index.js" /> -->
    <!-- <script src="./test/custom-renderer/handlebars/handlebars.min.4.7.8.js"></script> -->
    <script type="module" src="./test/components/index.js"></script>
    <link rel="stylesheet" href="./test/styles.css">
</head>

<body>
    <?php
    // echo "{$_SERVER['HTTP_HOST']} {$_SERVER['PHP_SELF']}";
    // print('<pre>');
    // print_r($_SERVER);
    // print('</pre>');
    ?>
    <router-container base-path="/swc">
        <header class="navigation">
            <nav>
                <router-link to="/">Home</router-link>
                <router-link to="/about">About</router-link>
                <router-link to="/users">Users</router-link>
                <router-link to="/thing">Thing</router-link>
            </nav>
        </header>

        <main>
            <router-switch>
                <router-route path="/" src="./test/pages/home-page.html">
                    <?php
                    if ($_SERVER['REQUEST_URI'] === "{$base_url}/") {
                        echo file_get_contents(__DIR__ . '/test/pages/home-page.html');
                    }
                    ?>
                </router-route>
                <router-route path="/about" src="./test/pages/about-page.html"></router-route>
                <router-route path="/users/*" src="./test/pages/users-page.html" no-cache>
                    <?php
                    if ($_SERVER['REQUEST_URI'] === "{$base_url}/users") {
                        echo file_get_contents(__DIR__ . '/test/pages/users-page.html');
                    }
                    ?>
                </router-route>

                <router-route path="/*" src="./test/pages/404.html"></router-route>
            </router-switch>
        </main>
    </router-container>
</body>

</html>