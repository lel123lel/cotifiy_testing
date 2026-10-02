## 1. Install Dependencies

Laravel projects do not include the `vendor/` or `node_modules/` directories in GitHub. You must install the required dependencies manually.

### PHP Dependencies

Run the following command to install the Laravel backend dependencies and create the `vendor/` directory:

```bash
composer install
```

### Frontend Dependencies

Run the following command to install the frontend packages and create the `node_modules/` directory:

```bash
npm install
```

> **Note:** If you are using Yarn instead of npm, you can run `yarn install`.

---

## 2. Create the Environment File

The `.env` file will be provided separately.

Place the provided `.env` file in the root directory of the Laravel project.

---

## 3. Generate the Application Key

Laravel requires a unique application key to secure user sessions and encrypted data.

Run the following command:

```bash
php artisan key:generate
```

This will automatically generate and populate the `APP_KEY` value in your `.env` file.

---
