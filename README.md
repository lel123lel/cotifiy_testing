1. Install Dependencies
Laravel projects do not include core framework files or frontend packages on GitHub. You must download them manually.
• PHP Packages: Run composer install to create the vendor/ directory and install all backend dependencies.
• Frontend Packages: Run npm install (or yarn install) to create the node_modules/ directory for your frontend assets.
2. Create the Environment File
I will send the .env file myself
3. Generate the Application Key
Laravel requires a unique key to secure user sessions and encrypted data.
• Generate the key: Run php artisan key:generate. This will automatically populate the APP_KEY value inside your .env file.
