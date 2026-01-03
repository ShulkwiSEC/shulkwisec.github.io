### 💬 Setting Up Reactions & Comments
Enable likes, dislikes, and comments on your pages using **Giscus**. Follow these steps to configure your repository:

---

#### 1. Enable Discussions
Go to your GitHub repository **Settings**. Under the **Features** section, check the box to enable **Discussions**.

![Enable Discussions](/images/enable_disccs_at_repo.png)

#### 2. Configure Giscus
Visit [giscus.app](https://giscus.app). In the **Configuration** section, enter your repository name in the `username/repo` format.

![Configure Giscus](/images/giscus_configrations_example.png)

#### 3. Mapping & Category
Choose how Giscus matches your pages to discussions:
* **Mapping:** Select **"Discussion title contains page pathname"**.
* **Category:** Choose a category (e.g., **Announcements**) where comments will be stored.

![Mapping & Category](/images/select_discussion_category.png)

#### 4. Copy Configuration
Scroll down to the **Enable giscus** section. Locate your unique values (like `repoId` and `categoryId`) and paste them into the configuration form.

![Copy Config](/images/giscus_github_get_configrations_from_there.png)