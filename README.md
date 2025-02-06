<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ahmed | Cybersecurity & Software Engineer</title>
    <link rel="stylesheet" href="https://t4.ftcdn.net/jpg/00/63/06/45/360_F_63064599_c2YEM1vnauuB1eenrhrAhhaSNwUHx2vQ.jpg">
    <script defer src="/static/script.js"></script>
    <style>
        body {
            background-color: #121212;
            color: #ffffff;
            font-family: Arial, sans-serif;
            text-align: center;
            animation: fadeIn 1s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .container {
            margin-top: 50px;
        }
        img {
            border-radius: 50%;
            width: 150px;
            height: 150px;
        }
        .social-links a {
            color: #1e90ff;
            margin: 0 10px;
            text-decoration: none;
            transition: color 0.3s;
        }
        .social-links a:hover {
            color: #ffcc00;
        }
        iframe {
            width: 80%;
            height: 500px;
            border: none;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Ahmed</h1>
        <h2>Cybersecurity Researcher & Software Engineer</h2>
        <img src="/static/profile.jpg" alt="Ahmed's Profile Picture">
        <div class="social-links" id="socialLinks"></div>
        <iframe src="/static/cv.pdf"></iframe>
    </div>

    <script>
        const socialLinks = {
            github: "https://github.com/your-placeholder",
            linkedin: "https://linkedin.com/in/your-placeholder",
            twitter: "https://twitter.com/your-placeholder"
        };
        
        const linksContainer = document.getElementById('socialLinks');
        for (const [platform, url] of Object.entries(socialLinks)) {
            const linkElement = document.createElement('a');
            linkElement.href = url;
            linkElement.target = "_blank";
            linkElement.innerText = platform.charAt(0).toUpperCase() + platform.slice(1);
            linksContainer.appendChild(linkElement);
        }
    </script>
</body>
</html>
