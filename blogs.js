// Sample blogs data with additional fields for reading mode.
function loadBlogs() {
    const BLOGS = {
      NONE_EMBED: [
        {
          id: 1,
          title: "Understanding Cybersecurity",
          description:
            "A deep dive into modern security practices and why they matter.",
          banner:
            "https://vitbhopal.ac.in/wp-content/uploads/2022/04/Cyber-Security1.jpg",
          content: `<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque interdum, urna at volutpat cursus, quam arcu dictum risus, a vulputate magna risus vitae nulla. Vivamus ultricies magna in sem tempor, non aliquet sapien tincidunt.</p>
                    <p>In hac habitasse platea dictumst. Morbi sed dui libero. Duis commodo elit ac elit fermentum, non sagittis orci consectetur. Sed at tincidunt erat.</p>`
        },
        {
          id: 2,
          title: "Top 10 Hacking Techniques",
          description:
            "An insider look at common methods used by hackers and how to defend against them.",
          banner:
            "https://www.pandasecurity.com/en/mediacenter/src/uploads/2021/02/pandasecurity-weird-hacking.jpg",
          content: `<p>Curabitur at libero ac erat ornare convallis. Praesent imperdiet, ex ac tincidunt semper, ex erat pulvinar dui, in ullamcorper ipsum sapien eget purus. Integer scelerisque velit a ipsum scelerisque, in ullamcorper ex vestibulum.</p>
                    <p>Suspendisse potenti. Nullam ac metus eget dui posuere blandit. Morbi faucibus erat vel nisi aliquet, eget tristique mi condimentum.</p>`
        },
        {
          id: 3,
          title: "Securing Your Digital Identity",
          description:
            "Best practices and tools to keep your online persona safe in today’s digital landscape.",
          banner:
            "https://learn.g2.com/hubfs/G2CM_FI769_Learn_Article_Images-%5BDigital_Identity%5D_V1b.png",
          content: `<p>Etiam non ex at velit fermentum pretium. Maecenas luctus, erat a commodo dictum, tortor metus maximus purus, vitae convallis ligula nibh non ligula. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae;</p>
                    <p>Vivamus a diam non justo tincidunt consectetur. Proin luctus, nulla ut cursus commodo, dui elit semper ipsum, ac tristique sem erat non odio.</p>`
        
          }
      ],
      SOCIAL: {
        twitter: [
          {
            id: 4,
            title: "Tweet from #Blackhatmea",
            description: "#BHMEA23. BHMEA24",
            banner: "https://upload.wikimedia.org/wikipedia/en/9/97/Black_Hat_Middle_East_and_Africa_Logo.svg",
            content: `<p>This is the full content for the tweet-style blog post. Here you can include additional commentary, analysis, or related content.</p>`,
            embed: ''
          },
        ],
        // end
      }
    };

    // Function to open the blog reading mode modal with the provided blog data.
    function showBlog(blog) {
      document.getElementById("blogModalLabel").innerText = blog.title;
      document.getElementById("blogBanner").src = blog.banner;
      document.getElementById("blogDescription").innerText = blog.description;
      document.getElementById("blogContent").innerHTML = blog.content;
      // Show the modal
      new bootstrap.Modal(document.getElementById("blogModal")).show();
    }

    // Render NONE_EMBED blogs into the #none-embed-blogs container.
    const noneEmbedContainer = document.getElementById("none-embed-blogs");
    BLOGS.NONE_EMBED.forEach((blog, index) => {
      const col = document.createElement("div");
      col.className = "col-md-4 mb-4";
      col.innerHTML = `
        <div class="card h-100 blog-card shadow-sm" data-index="${index}">
          <img src="${blog.banner}" class="card-img-top" alt="${blog.title}">
          <div class="card-body">
            <h5 class="card-title">${blog.title}</h5>
            <p class="card-text">${blog.description}</p>
          </div>
        </div>
      `;
      // Attach click event to open reading mode.
      col.addEventListener("click", () => {
        showBlog(blog);
      });
      noneEmbedContainer.appendChild(col);
    });

    // Render SOCIAL feeds horizontally into #social-horizontal container.
    const socialContainer = document.getElementById("social-horizontal");
    // Loop through each social platform (e.g., twitter, instagram)
    Object.keys(BLOGS.SOCIAL).forEach((platform) => {
      BLOGS.SOCIAL[platform].forEach((post) => {
        const postDiv = document.createElement("div");
        postDiv.className = "social-post shadow-sm";
        // Include the embed below the description as a preview.
        postDiv.innerHTML = `
        <div>
          <img src="${post.banner}" alt="${post.title}" style="object-fit: cover; border-radius: 0.25rem;">
          <h5 class="mt-2">${post.title}</h5>
          <p class="small">${post.description}</p>
          <div class="mt-2">
            ${post.embed}
          </div>
        </div>
        `;
        // Attach click event for reading mode.
        postDiv.addEventListener("click", () => {
          showBlog(post);
        });
        socialContainer.appendChild(postDiv);
      });
    });
  }

  // Call loadBlogs when the DOM is ready.
  document.addEventListener("DOMContentLoaded", loadBlogs);