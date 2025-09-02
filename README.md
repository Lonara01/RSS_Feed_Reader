![RSS Feed News Preview](/assets/images/RSS_Feed_News.webp)
# 🌐 [Live Demo](https://abddomain.epizy.com/rss)

# 🗺️ RSS Feed Reader

A modern, lightweight **news aggregator web app** built with vanilla JavaScript.  
It lets you **add, save, and manage RSS feed URLs**, fetches articles via Node.js/PHP parsers, and displays them in **grid or list view**.  
Includes **pagination, feed management, localStorage persistence, and SweetAlert2 integration** for a clean user experience.

---

## ✨ Features

| Feature                | Description                                                                 |
|------------------------|-----------------------------------------------------------------------------|
| 🗞️ RSS Aggregation      | Collects news from multiple RSS feeds using Node.js and PHP parsers         |
| 📱 Responsive Design    | Works on desktop, tablet, and mobile devices                                |
| 🛠️ Customizable Sources | Easily add or remove RSS feed URLs                                          |
| ⭐️ Font Awesome Icons   | Intuitive and visually appealing interface                                  |
| 🖌️ Theme Customization  | SCSS-based styling for easy color and layout changes                        |

---

## 🛠️ Technologies Used

| Technology      | Purpose                                |
|-----------------|----------------------------------------|
| 💻 **JavaScript**  | Core logic and UI interactions          |
| 🟩 **Node.js**     | RSS parsing backend (optional)          |
| 🐘 **PHP**         | Alternative parser (Feed-io / SimplePie)|
| 🎨 **SCSS**        | Styling and theming                     |
| ⚙️ **Gulp**        | Build automation and live reloading     |
| ⭐️ **Font Awesome**| Feed icons                              |
| 🔔 **SweetAlert2** | Interactive user alerts                 |

---

## 📁 Folder Structure

| Folder/File         | Description                                 |
|---------------------|---------------------------------------------|
|  `assets/`           | Frontend JS, SCSS, config files             |
|  `rss_parsers/`      | Node.js & PHP RSS feed parsers              |
|  `index.html`        | Main web interface                          |
|  `gulpfile.js`       | Build and watch tasks                       |
|  `README.md`         | Project documentation                       |

---

## 🚀 Getting Started


Follow these steps to set up the project on your local machine.

> **Note:** You only need to set up one backend server—either Node.js or PHP—depending on your preference and environment. Setting up both is not required.

### 1. 🧩 Prerequisites


Before starting, make sure you have installed the following (choose either Node.js or PHP):

- **Node.js (Windows/Mac/Linux)**  
  - Download from [nodejs.org](https://nodejs.org/) and install.  
  - Verify installation:
  ```bash
  node -v
  npm -v
  ```
- **PHP (with Apache/Nginx local server)**
  - Install [XAMPP](https://www.apachefriends.org/) (Windows/Mac/Linux) or use a local Apache setup.
  - Make sure PHP is accessible from your terminal:
  ```bash
  php -v
  ```
- **Composer** (for PHP dependencies)
  - Download from [getcomposer.org](https://getcomposer.org/)
  - Verify installation:
  ```bash
  composer -V
  ```

---

### 2. 🗂️ Clone the Repository

```bash
git clone https://github.com/your-username/rss-feed-reader.git
cd rss-feed-reader
```

---

### 3. 📦 Install Dependencies


Depending on which backend parser you want to use:

- **Node.js Backend**
  - Open a terminal and navigate to the Node parser directory:
    ```bash
    cd rss_parsers/node_parser
    ```
  - Start the Node.js server:
    ```bash
    node index.js
    ```

- **PHP Parser**
  - Open a terminal and navigate to the PHP parser directory:
    ```bash
    cd rss_parsers/php_parser
    ```
	```bash
    composer install
    ```

---

### 3.1 Configure Backend Parser

Before running the project, choose which backend server (Node.js or PHP) to use by editing the configuration in `assets/js/config.js`:

```js
export const parserType = 'php'; // or 'node';
export const numberOfItems = [11, 20, 30, 9999];
export const FONT_AWESOME_ICONS_URL = '../dist/json/font-awesome-free-icons.json';
export const PHP_PARSER_URL = 'http://localhost/rss_parser/index.php';
```

Set `parserType` to `'php'` or `'node'` depending on which backend you want to use. Adjust other settings as needed for your environment.

---

### 4. ▶️ Run the Project


- Open the project in a **live server environment** (e.g., VS Code Live Server, Apache, or similar).
  > ⚠️ Directly opening `index.html` in your browser **will not work properly** because feeds must be fetched via a server.

---

### 5. 🔗 Accessing Feeds

- Add RSS feed URLs via the app’s interface.
- Feeds will be fetched using either **Node.js** or **PHP**, depending on your setup.

#### 📚 RSS Feed Resources

Looking for RSS feeds to add? Check out [Awesome RSS Feeds](https://github.com/plenaryapp/awesome-rss-feeds) for a curated list of useful feeds.

---

## 🤝 Contributing

Contributions are welcome!
Open issues or submit pull requests for improvements and bug fixes.

---

## 📝 License

This project is licensed under the **MIT License**.
Feel free to use, modify, and distribute.