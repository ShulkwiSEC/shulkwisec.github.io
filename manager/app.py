import customtkinter as ctk
import json
import os
from tkinter import messagebox
from typing import Any, Dict
from datetime import datetime
import base64
import urllib.parse
import tkinter

import shutil
import zipfile
import subprocess
from tkinter import filedialog

# Configuration
ctk.set_appearance_mode("Dark") 
ctk.set_default_color_theme("blue")

PATH_TO_JSON = os.path.join(os.path.dirname(__file__), "..", "client", "src", "data", "template.json")
PATH_CLIENT_DATA = os.path.join(os.path.dirname(__file__), "..", "client", "src", "data")
PATH_CLIENT_PUBLIC = os.path.join(os.path.dirname(__file__), "..", "client", "public")
PATH_MANIFEST = os.path.join(PATH_CLIENT_PUBLIC, "manifest.json")

# Fonts
FONT_HEADER = ("Segoe UI", 24, "bold")
FONT_SUBHEADER = ("Segoe UI", 18, "bold")
FONT_LABEL = ("Segoe UI", 12)
FONT_MONO = ("Consolas", 12)

class MultilingualEntry(ctk.CTkFrame):
    def __init__(self, master, label_text, languages=None, **kwargs):
        super().__init__(master, fg_color="transparent", **kwargs)
        self.grid_columnconfigure(0, weight=1) # Label
        
        self.languages = languages if languages else ["en", "ar"]
        self.entries = {}

        self.label = ctk.CTkLabel(self, text=label_text, font=FONT_LABEL)
        self.label.grid(row=0, column=0, sticky="w", pady=(0, 2))
        
        # Dynamically create entries
        for i, lang in enumerate(self.languages):
            self.grid_columnconfigure(i, weight=1)
            entry = ctk.CTkEntry(self, placeholder_text=lang.upper())
            # Right Justify for Arabic/Hebrew/Persian etc if we want to be smart, 
            # for now hardcode 'ar' check or leave default.
            if lang == 'ar':
                entry.configure(justify="right")
            
            entry.grid(row=1, column=i, padx=(0, 5) if i < len(self.languages)-1 else 0, sticky="ew")
            self.entries[lang] = entry

    def get(self):
        data = {}
        for lang, entry in self.entries.items():
            data[lang] = entry.get()
        return data

    def set(self, data):
        for lang, entry in self.entries.items():
            entry.delete(0, "end")
            if isinstance(data, dict):
                entry.insert(0, data.get(lang, ""))
            elif isinstance(data, str) and lang == "en": # Fallback
                entry.insert(0, data)

    def bind_change(self, callback):
        for entry in self.entries.values():
            entry.bind("<KeyRelease>", lambda e: callback(self.get()))

    def enable_context_menu(self):
        for entry in self.entries.values():
            self._add_menu(entry._entry)

    def _add_menu(self, widget):
        menu = tkinter.Menu(widget, tearoff=0)
        menu.add_command(label="Cut", command=lambda: widget.event_generate("<<Cut>>"))
        menu.add_command(label="Copy", command=lambda: widget.event_generate("<<Copy>>"))
        menu.add_command(label="Paste", command=lambda: widget.event_generate("<<Paste>>"))
        menu.add_separator()
        menu.add_command(label="Select All", command=lambda: widget.event_generate("<<SelectAll>>"))
        widget.bind("<Button-3>", lambda e: menu.tk_popup(e.x_root, e.y_root))

# Alias for compatibility if needed, but better to update calls to fetch current langs
class BilingualEntry(MultilingualEntry):
    def __init__(self, master, label_text, **kwargs):
        # We need access to app data for dynamic langs. 
        # Since we can't easily pass 'app' instance to all existing calls without big refactor,
        # we will rely on a static/global or just default to en/ar if not passed, 
        # BUT the best way is to pass `languages` from the caller (the App)
        super().__init__(master, label_text, **kwargs)

# In DataManagerApp methods, we must pass `languages=self.get_languages()` to MultilingualEntry


class LabeledEntry(ctk.CTkFrame):
    # ... (Keep existing LabeledEntry)
    def __init__(self, master, label_text, **kwargs):
        super().__init__(master, fg_color="transparent", **kwargs)
        self.grid_columnconfigure(0, weight=1)
        self.label = ctk.CTkLabel(self, text=label_text, font=FONT_LABEL)
        self.label.grid(row=0, column=0, sticky="w", pady=(0, 2))
        
        self.entry = ctk.CTkEntry(self)
        self.entry.grid(row=1, column=0, sticky="ew")
    
    def get(self):
        return self.entry.get()

    def set(self, text):
        self.entry.delete(0, "end")
        self.entry.insert(0, str(text) if text is not None else "")
        
    def bind_change(self, callback):
        self.entry.bind("<KeyRelease>", lambda e: callback(self.get()))

    def enable_context_menu(self):
        self._add_menu(self.entry._entry)
    
    def _add_menu(self, widget):
        menu = tkinter.Menu(widget, tearoff=0)
        menu.add_command(label="Cut", command=lambda: widget.event_generate("<<Cut>>"))
        menu.add_command(label="Copy", command=lambda: widget.event_generate("<<Copy>>"))
        menu.add_command(label="Paste", command=lambda: widget.event_generate("<<Paste>>"))
        menu.add_separator()
        menu.add_command(label="Select All", command=lambda: widget.event_generate("<<SelectAll>>"))
        widget.bind("<Button-3>", lambda e: menu.tk_popup(e.x_root, e.y_root))


class DataManagerApp(ctk.CTk):
    # ... (Keep Init)
    def __init__(self):
        super().__init__()

        self.title("Sahb | Data Center Manager")
        self.geometry("1400x900") # Increased size for multi columns

        self.data: Dict[str, Any] = {}
        self.manifest_data: Dict[str, Any] = {}
        self.current_post = None
        self.load_data()
        
        # Helper to get langs
        self.get_languages = lambda: self.data.get("site", {}).get("languages", ["en", "ar"])

        # Main Layout (Sidebar + Content)
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

        # Sidebar
        self.sidebar = ctk.CTkFrame(self, width=240, corner_radius=0, fg_color="#1e1e1e")
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        self.sidebar.grid(row=0, column=0, sticky="nsew")
        self.sidebar.grid_rowconfigure(7, weight=1) # Spacer row

        # Logo / Brand
        self.logo_label = ctk.CTkLabel(self.sidebar, text="  Sahb Manager", font=("Segoe UI", 26, "bold"), text_color="#ffffff")
        self.logo_label.grid(row=0, column=0, padx=20, pady=(30, 20), sticky="w")

        # Navigation Buttons
        self.btn_dashboard = self.create_sidebar_button("General Info", 1, "🏠")
        self.btn_about = self.create_sidebar_button("About & Skills", 2, "👤")
        self.btn_blog = self.create_sidebar_button("Blog Posts", 3, "📝")
        self.btn_sync = self.create_sidebar_button("External Sync", 4, "🔄")
        self.btn_achievements = self.create_sidebar_button("Achievements", 5, "🏆")
        self.btn_settings = self.create_sidebar_button("Settings", 6, "⚙️")

        # Footer Actions (Save & Status)
        footer_frame = ctk.CTkFrame(self.sidebar, fg_color="transparent")
        footer_frame.grid(row=8, column=0, padx=10, pady=20, sticky="ew")

        self.save_btn = ctk.CTkButton(footer_frame, text="💾  SAVE CHANGES", command=self.save_data, 
                                      fg_color="#2ecc71", hover_color="#27ae60", 
                                      font=("Segoe UI", 13, "bold"), height=40, corner_radius=8)
        self.save_btn.pack(fill="x", pady=(0, 10))
        
        self.push_btn = ctk.CTkButton(footer_frame, text="☁️  PUSH UPDATES", command=self.push_to_remote, 
                                      fg_color="#3498db", hover_color="#2980b9", 
                                      font=("Segoe UI", 13, "bold"), height=40, corner_radius=8)
        self.push_btn.pack(fill="x", pady=(0, 10))

        self.status_label = ctk.CTkLabel(footer_frame, text="Ready", text_color="gray50", font=("Segoe UI", 11))
        self.status_label.pack(anchor="center")

        # Content Area
        self.content_area = ctk.CTkFrame(self, corner_radius=0, fg_color="transparent")
        self.content_area.grid(row=0, column=1, sticky="nsew", padx=30, pady=30)
        self.content_area.grid_columnconfigure(0, weight=1)
        self.content_area.grid_rowconfigure(0, weight=1)

        # Frames
        self.frame_dashboard = ctk.CTkScrollableFrame(self.content_area)
        self.frame_about = ctk.CTkScrollableFrame(self.content_area)
        self.frame_blog = ctk.CTkFrame(self.content_area, fg_color="transparent") 
        self.frame_sync = ctk.CTkScrollableFrame(self.content_area) 
        self.frame_achievements = ctk.CTkScrollableFrame(self.content_area)
        self.frame_settings = ctk.CTkScrollableFrame(self.content_area)

        self.setup_dashboard()
        self.setup_about()
        self.setup_blog()
        self.setup_sync() 
        self.setup_achievements()
        self.setup_settings()

        # Default View
        self.select_frame_by_name("General Info")

    # ... [Keep create_sidebar_button, select_frame_by_name] ...

    # --- DASHBOARD ---
    def setup_dashboard(self):
        f = self.frame_dashboard
        ctk.CTkLabel(f, text="General Information", font=FONT_HEADER).pack(anchor="w", pady=(0, 20))

        langs = self.get_languages()

        # Owner
        ctk.CTkLabel(f, text="Owner Information", font=FONT_SUBHEADER, text_color="#3498db").pack(anchor="w", pady=10)
        self.owner_name = MultilingualEntry(f, "Name", languages=langs)
        self.owner_name.pack(fill="x", pady=5)
        self.owner_bio = MultilingualEntry(f, "Short Bio", languages=langs)
        self.owner_bio.pack(fill="x", pady=5)
        self.owner_email = LabeledEntry(f, "Email")
        self.owner_email.pack(fill="x", pady=5)

        # Site
        ctk.CTkLabel(f, text="Site Metadata", font=FONT_SUBHEADER, text_color="#3498db").pack(anchor="w", pady=(20, 10))
        self.site_title = MultilingualEntry(f, "Site Title", languages=langs)
        self.site_title.pack(fill="x", pady=5)
        self.site_subtitle = MultilingualEntry(f, "Site Subtitle", languages=langs)
        self.site_subtitle.pack(fill="x", pady=5)
        self.site_desc = MultilingualEntry(f, "Description", languages=langs)
        self.site_desc.pack(fill="x", pady=5)
        self.site_url = LabeledEntry(f, "Site URL")
        self.site_url.pack(fill="x", pady=5)
        
        # ... logic to populate data ...

    # ... [Update setup_about, setup_achievements to use MultilingualEntry with langs] ...

    def create_trans_row(self, key):
        row = ctk.CTkFrame(self.trans_container)
        row.pack(fill="x", pady=2)
        
        # Key Label
        ctk.CTkLabel(row, text=key, font=("Consolas", 12), width=150, anchor="w").pack(side="left", padx=10)
        
        val = self.data["translations"][key]
        langs = self.get_languages()
        
        self.trans_entries = getattr(self, "trans_entries", {})
        if key not in self.trans_entries: self.trans_entries[key] = {}

        for lang in langs:
             entry = ctk.CTkEntry(row, placeholder_text=lang.upper(), width=100)
             entry.insert(0, val.get(lang, ""))
             entry.pack(side="left", fill="x", expand=True, padx=2)
             
             # Bind
             def update_t(k=key, l=lang, e=entry):
                 if k not in self.data["translations"]: self.data["translations"][k] = {}
                 self.data["translations"][k][l] = e.get()
             
             entry.bind("<KeyRelease>", lambda e, k=key, l=lang, ent=entry: update_t(k, l, ent))

        # Delete
        ctk.CTkButton(row, text="X", width=30, fg_color="#e74c3c", 
                      command=lambda k=key: self.delete_translation(k)).pack(side="right", padx=5)

    def create_sidebar_button(self, text, row, icon):
        display_text = f"  {icon}   {text}"
        btn = ctk.CTkButton(self.sidebar, text=display_text, 
                            command=lambda: self.select_frame_by_name(text), 
                            fg_color="transparent", 
                            text_color="#a0a0a0", 
                            hover_color="#2b2b2b",
                            font=("Segoe UI", 14),
                            anchor="w", 
                            height=45,
                            corner_radius=8)
        btn.grid(row=row, column=0, sticky="ew", padx=10, pady=5)
        return btn

    def select_frame_by_name(self, name):
        # Update buttons styling
        buttons = {
            "General Info": self.btn_dashboard,
            "About & Skills": self.btn_about,
            "Blog Posts": self.btn_blog,
            "External Sync": self.btn_sync,
            "Achievements": self.btn_achievements,
            "Settings": self.btn_settings
        }
        
        for btn_name, btn in buttons.items():
            if btn_name == name:
                # Active State
                btn.configure(fg_color="#2b2b2b", text_color="#ffffff")
            else:
                # Inactive State
                btn.configure(fg_color="transparent", text_color="#a0a0a0")

        # Handle Frame Switching
        self.frame_dashboard.grid_forget()
        self.frame_about.grid_forget()
        self.frame_blog.grid_forget()
        self.frame_sync.grid_forget()
        self.frame_achievements.grid_forget()
        self.frame_settings.grid_forget()

        if name == "General Info": self.frame_dashboard.grid(row=0, column=0, sticky="nsew")
        elif name == "About & Skills": self.frame_about.grid(row=0, column=0, sticky="nsew")
        elif name == "Blog Posts": self.frame_blog.grid(row=0, column=0, sticky="nsew")
        elif name == "External Sync": self.frame_sync.grid(row=0, column=0, sticky="nsew")
        elif name == "Achievements": self.frame_achievements.grid(row=0, column=0, sticky="nsew")
        elif name == "Settings": self.frame_settings.grid(row=0, column=0, sticky="nsew")

    # ... (rest of methods)

    # --- EXTERNAL SYNC ---
    def setup_sync(self):
        f = self.frame_sync
        ctk.CTkLabel(f, text="External GitHub Sync", font=FONT_HEADER).pack(anchor="w", pady=(0, 20))
        ctk.CTkLabel(f, text="Add GitHub repositories to automatically fetch blog posts from.", font=FONT_LABEL, text_color="gray").pack(anchor="w", pady=(0, 20))
        
        self.sync_container = ctk.CTkFrame(f, fg_color="transparent")
        self.sync_container.pack(fill="x")
        self.refresh_sync_list()
        
        ctk.CTkButton(f, text="+ Add Repository", command=self.add_sync_repo).pack(pady=20)

    def refresh_sync_list(self):
        for w in self.sync_container.winfo_children():
            w.destroy()
            
        # Ensure externalSources exists
        if "blog" not in self.data: self.data["blog"] = {}
        if "externalSources" not in self.data["blog"]: self.data["blog"]["externalSources"] = []
        
        sources = self.data["blog"]["externalSources"]
        
        for i, url in enumerate(sources):
            self.create_sync_row(i, url)

    def create_sync_row(self, idx, url):
        row = ctk.CTkFrame(self.sync_container)
        row.pack(fill="x", pady=5)
        
        row.grid_columnconfigure(0, weight=1)
        
        # Simple Entry for URL
        entry = ctk.CTkEntry(row, placeholder_text="https://github.com/owner/repo")
        entry.insert(0, url)
        entry.grid(row=0, column=0, sticky="ew", padx=10, pady=5)
        
        # Binding
        def update_url(val):
            self.data["blog"]["externalSources"][idx] = val
        entry.bind("<KeyRelease>", lambda e: update_url(entry.get()))
        
        ctk.CTkButton(row, text="Remove", width=60, fg_color="#e74c3c", 
                      command=lambda: self.delete_sync_repo(idx)).grid(row=0, column=1, padx=5)

    def add_sync_repo(self):
        if "blog" not in self.data: self.data["blog"] = {}
        if "externalSources" not in self.data["blog"]: self.data["blog"]["externalSources"] = []
        
        self.data["blog"]["externalSources"].append("")
        self.refresh_sync_list()

    def delete_sync_repo(self, idx):
        self.data["blog"]["externalSources"].pop(idx)
        self.refresh_sync_list()

    def load_data(self):
        try:
            with open(PATH_TO_JSON, 'r', encoding='utf-8') as f:
                self.data = json.load(f)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load JSON: {e}")
            self.data = {}

        try:
            if os.path.exists(PATH_MANIFEST):
                with open(PATH_MANIFEST, 'r', encoding='utf-8') as f:
                    self.manifest_data = json.load(f)
            else:
                self.manifest_data = {}
        except Exception as e:
            messagebox.showwarning("Warning", f"Failed to load manifest.json: {e}")
            self.manifest_data = {}

    def save_data(self):
        # Trigger update from current edits if possible
        if self.current_post:
            self.save_current_post_edits()

        try:
            # Validate Skills JSON
            skills_json = json.loads(self.skills_text.get("1.0", "end").strip())
            self.data["about"]["skills"]["items"] = skills_json
            
            # Save Pagination settings if exists
            if hasattr(self, 'pagination_entry'):
                try:
                    self.data["site"]["pagination_per_page"] = int(self.pagination_entry.get())
                except:
                    pass # Ignore invalid int
            
            # Save Comments Config
            if hasattr(self, 'comm_repo'):
                if "site" not in self.data: self.data["site"] = {}
                if "comments" not in self.data["site"]: 
                    self.data["site"]["comments"] = {"provider": "giscus", "giscus": {}}
                
                g_conf = self.data["site"]["comments"]["giscus"]
                g_conf["repo"] = self.comm_repo.get()
                g_conf["repoId"] = self.comm_repo_id.get()
                g_conf["category"] = self.comm_cat.get()
                g_conf["categoryId"] = self.comm_cat_id.get()
                
                # Ensure defaults if missing
                if "provider" not in self.data["site"]["comments"]:
                    self.data["site"]["comments"]["provider"] = "giscus"
                if "mapping" not in g_conf: g_conf["mapping"] = "pathname"
                if "strict" not in g_conf: g_conf["strict"] = "0"
                if "reactionsEnabled" not in g_conf: g_conf["reactionsEnabled"] = "1"
                if "emitMetadata" not in g_conf: g_conf["emitMetadata"] = "0"
                if "inputPosition" not in g_conf: g_conf["inputPosition"] = "top"
                if "theme" not in g_conf: g_conf["theme"] = "preferred_color_scheme"
                if "loading" not in g_conf: g_conf["loading"] = "lazy"
                if "lang" not in g_conf: g_conf["lang"] = "en"

        except Exception:
             pass 

        try:
            with open(PATH_TO_JSON, 'w', encoding='utf-8') as f:
                json.dump(self.data, f, indent=2, ensure_ascii=False)
            
            if self.manifest_data:
                with open(PATH_MANIFEST, 'w', encoding='utf-8') as f:
                    json.dump(self.manifest_data, f, indent=2, ensure_ascii=False)

            self.status_label.configure(text="Saved at " + datetime.now().strftime("%H:%M:%S"))
            self.generate_seo_files()
            messagebox.showinfo("Success", "Data saved successfully and SEO files optimized!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save: {e}")

    def generate_seo_files(self):
        """Generates sitemap.xml and robots.txt based on current data."""
        try:
            site_url = self.data.get("site", {}).get("url", "https://shulkwisec.github.io")
            if site_url.endswith('/'):
                site_url = site_url[:-1]
            
            posts = self.data.get("blog", {}).get("posts", [])
            today = datetime.now().strftime("%Y-%m-%d")

            # 1. Sitemap.xml
            sitemap_path = os.path.join(PATH_CLIENT_PUBLIC, "sitemap.xml")
            sitemap_content = '<?xml version="1.0" encoding="UTF-8"?>\n'
            sitemap_content += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            
            # Home
            sitemap_content += f'  <url>\n    <loc>{site_url}/</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n'
            
            # About
            sitemap_content += f'  <url>\n    <loc>{site_url}/about</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n'

            # External Pages
            external_pages = self.data.get("site", {}).get("external", [])
            for page in external_pages:
                p_url = page.get("url")
                if p_url:
                    if not p_url.startswith('/'):
                        p_url = '/' + p_url
                    sitemap_content += f'  <url>\n    <loc>{site_url}{p_url}</loc>\n    <lastmod>{today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n'
            
            # Posts
            # Posts
            for post in posts:
                p_id = post.get("id")
                p_date_raw = post.get("date", today)
                # Try parsing date
                try:
                    # Attempt standard formats
                    dt = datetime.strptime(p_date_raw, "%B %d, %Y")
                    p_date = dt.strftime("%Y-%m-%d")
                except ValueError:
                    try:
                        dt = datetime.strptime(p_date_raw, "%Y-%m-%d")
                        p_date = dt.strftime("%Y-%m-%d")
                    except ValueError:
                        # Fallback to today if parsing fails
                        p_date = today

                if p_id:
                    sitemap_content += f'  <url>\n    <loc>{site_url}/post/{p_id}</loc>\n    <lastmod>{p_date}</lastmod>\n    <priority>0.7</priority>\n  </url>\n'

            sitemap_content += '</urlset>'

            with open(sitemap_path, 'w', encoding='utf-8') as f:
                f.write(sitemap_content)

            # 2. Robots.txt
            robots_path = os.path.join(PATH_CLIENT_PUBLIC, "robots.txt")
            robots_content = f"User-agent: *\nAllow: /\n\nSitemap: {site_url}/sitemap.xml"
            with open(robots_path, 'w', encoding='utf-8') as f:
                f.write(robots_content)

            print("✅ SEO files (sitemap.xml, robots.txt) generated/updated.")
        except Exception as e:
            print(f"❌ Error generating SEO files: {e}")

    def push_to_remote(self):
        # Determine the root of the repository (one level up from manager)
        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

        # 1. Check git config
        try:
             # Check if git is installed/configured
             subprocess.check_output(["git", "--version"], cwd=repo_root) 
        except:
             messagebox.showerror("Error", "Git is not installed or not in PATH.")
             return

        try:
             user_name = subprocess.check_output(["git", "config", "user.name"], cwd=repo_root).strip()
             user_email = subprocess.check_output(["git", "config", "user.email"], cwd=repo_root).strip()
             if not user_name or not user_email:
                 if messagebox.askyesno("Git Config", "Git user.name/email not set. Configure now? (Uses 'Ghost' default)"):
                      subprocess.check_call(["git", "config", "user.name", "Ghost"], cwd=repo_root)
                      subprocess.check_call(["git", "config", "user.email", "ghost@sahb.local"], cwd=repo_root)
                 else:
                      return
        except Exception as e:
             messagebox.showwarning("Git Config", f"Could not check git config: {e}")
             return
             
        # 2. Check remote
        try:
            remote = subprocess.check_output(["git", "remote", "-v"], cwd=repo_root).strip()
            if not remote:
                 # Check if user wants to add one? For now just error.
                 messagebox.showerror("Git Error", "No remote repository configured. Please add a remote origin manually.")
                 return
        except:
            messagebox.showerror("Git Error", "Not a git repository.")
            return

        # 3. Add, Commit, Push
        try:
            self.status_label.configure(text="Pushing...")
            self.update_idletasks()
            
            # Execute git add from the repository root to include all changes
            subprocess.check_call(["git", "add", "."], cwd=repo_root)
            
            # Check if there are changes to commit
            status = subprocess.check_output(["git", "status", "--porcelain"], cwd=repo_root)
            if status:
                subprocess.check_call(["git", "commit", "-m", f"Update from Manager {datetime.now().strftime('%Y-%m-%d %H:%M')}"], cwd=repo_root)
            
            subprocess.check_call(["git", "push"], cwd=repo_root)
            
            self.status_label.configure(text="Pushed at " + datetime.now().strftime("%H:%M:%S"))
            messagebox.showinfo("Success", "Successfully pushed changes to GitHub!")
        except Exception as e:
            self.status_label.configure(text="Push Failed")
            messagebox.showerror("Push Error", f"Failed to push changes: {e}\nCheck console/logs for details.")
    def setup_dashboard(self):
        f = self.frame_dashboard
        ctk.CTkLabel(f, text="General Information", font=FONT_HEADER).pack(anchor="w", pady=(0, 20))

        langs = self.get_languages()

        # Owner
        ctk.CTkLabel(f, text="Owner Information", font=FONT_SUBHEADER, text_color="#3498db").pack(anchor="w", pady=10)
        self.owner_name = MultilingualEntry(f, "Name", languages=langs)
        self.owner_name.pack(fill="x", pady=5)
        self.owner_bio = MultilingualEntry(f, "Short Bio", languages=langs)
        self.owner_bio.pack(fill="x", pady=5)
        self.owner_email = LabeledEntry(f, "Email")
        self.owner_email.pack(fill="x", pady=5)

        # Site
        ctk.CTkLabel(f, text="Site Metadata", font=FONT_SUBHEADER, text_color="#3498db").pack(anchor="w", pady=(20, 10))
        self.site_title = MultilingualEntry(f, "Site Title", languages=langs)
        self.site_title.pack(fill="x", pady=5)
        self.site_subtitle = MultilingualEntry(f, "Site Subtitle", languages=langs)
        self.site_subtitle.pack(fill="x", pady=5)
        self.site_desc = MultilingualEntry(f, "Description", languages=langs)
        self.site_desc.pack(fill="x", pady=5)
        self.site_url = LabeledEntry(f, "Site URL (Canonical)")
        self.site_url.pack(fill="x", pady=5)

        # Sync GUI with Data
        owner = self.data.get("owner", {})
        self.owner_name.set(owner.get("name"))
        self.owner_bio.set(owner.get("bio"))
        self.owner_email.set(owner.get("email"))

        site = self.data.get("site", {})
        self.site_title.set(site.get("title"))
        self.site_subtitle.set(site.get("subtitle"))
        self.site_desc.set(site.get("description"))
        self.site_url.set(site.get("url", "https://shulkwisec.github.io"))
        
        self.save_btn.configure(command=self.global_save_wrapper)

    def global_save_wrapper(self):
        # Pull General Data
        self.data["owner"]["name"] = self.owner_name.get()
        self.data["owner"]["bio"] = self.owner_bio.get()
        self.data["owner"]["email"] = self.owner_email.get()
        
        self.data["site"]["title"] = self.site_title.get()
        self.data["site"]["subtitle"] = self.site_subtitle.get()
        self.data["site"]["description"] = self.site_desc.get()
        self.data["site"]["url"] = self.site_url.get()
        
        # Pull About Data
        self.data["about"]["aboutTitle"] = self.about_title.get()
        self.data["about"]["aboutText"] = self.about_text.get()
        self.data["about"]["bio"] = self.about_bio.get()

        self.save_data()

    # --- ABOUT ---
    def setup_about(self):
        f = self.frame_about
        ctk.CTkLabel(f, text="About & Skills", font=FONT_HEADER).pack(anchor="w", pady=(0, 20))

        langs = self.get_languages()

        self.about_title = MultilingualEntry(f, "About Page Title", languages=langs)
        self.about_title.pack(fill="x", pady=5)
        
        self.about_text = MultilingualEntry(f, "Main About Text", languages=langs) 
        self.about_text.pack(fill="x", pady=5)

        self.about_bio = MultilingualEntry(f, "Long Bio", languages=langs)
        self.about_bio.pack(fill="x", pady=5)

        ctk.CTkLabel(f, text="Skills Configuration (JSON)", font=FONT_SUBHEADER).pack(anchor="w", pady=(20,5))
        self.skills_text = ctk.CTkTextbox(f, height=300, font=FONT_MONO)
        self.skills_text.pack(fill="x", pady=5)

        # Sync
        about = self.data.get("about", {})
        self.about_title.set(about.get("aboutTitle"))
        self.about_text.set(about.get("aboutText")) 
        self.about_bio.set(about.get("bio"))
        
        skills = about.get("skills", {}).get("items", [])
        self.skills_text.insert("1.0", json.dumps(skills, indent=2, ensure_ascii=False))

    # --- SETTINGS ---
    def setup_settings(self):
        f = self.frame_settings
        ctk.CTkLabel(f, text="Settings", font=FONT_HEADER).pack(anchor="w", pady=(0, 20))
        
        tabview = ctk.CTkTabview(f)
        tabview.pack(fill="both", expand=True)

        tabview.add("Languages")
        tabview.add("Comments") # New Tab
        tabview.add("General")
        tabview.add("Images")
        tabview.add("PWA Manifest")
        tabview.add("External Links")
        tabview.add("Swipeable Routes")

        # --- General Tab (Pagination, etc) ---
        t_gen = tabview.tab("General")
        ctk.CTkLabel(t_gen, text="Pagination", font=FONT_SUBHEADER).pack(anchor="w", pady=10)
        self.pagination_entry = LabeledEntry(t_gen, "Posts Per Page")
        self.pagination_entry.set(self.data.get("site", {}).get("pagination_per_page", 5))
        self.pagination_entry.pack(fill="x")
        
        # --- COMMENTS TAB ---
        t_comm = tabview.tab("Comments")
        
        # Split layout using Grid
        t_comm.grid_columnconfigure(0, weight=1) # Guide
        t_comm.grid_columnconfigure(1, weight=1) # Form
        t_comm.grid_rowconfigure(0, weight=1)

        # 1. Guide Section (Left Column)
        guide_container = ctk.CTkFrame(t_comm, fg_color="transparent")
        guide_container.grid(row=0, column=0, sticky="nsew", padx=(0, 10))
        
        ctk.CTkLabel(guide_container, text="Setup Guide", font=FONT_HEADER).pack(anchor="w", pady=(0, 10))
        
        guide_scroll = ctk.CTkScrollableFrame(guide_container, fg_color="transparent")
        guide_scroll.pack(fill="both", expand=True)
        
        steps = [
            ("1. Enable Discussions", "Enable 'Discussions' in your GitHub repository settings.", "enable_disccs_at_repo.png"),
            ("2. Configure Giscus", "Visit https://giscus.app and enter your repo username/name.", "giscus_configrations_example.png"),
            ("3. Mapping & Category", "Select 'Discussion title contains page pathname' and choose a Category (e.g. Announcements).", "select_discussion_category.png"),
            ("4. Copy Config", "Scroll to the bottom to find the values (repoId, categoryId, etc) and paste them into the form on the right ->", "giscus_github_get_configrations_from_there.png")
        ]
        
        PATH_IMAGES = os.path.join(os.path.dirname(__file__), "..", "images")
        from PIL import Image
        
        for title, desc, img_name in steps:
            step_frame = ctk.CTkFrame(guide_scroll, fg_color="#2b2b2b")
            step_frame.pack(fill="x", pady=10, padx=5)
            
            ctk.CTkLabel(step_frame, text=title, font=("Segoe UI", 14, "bold"), text_color="#3498db").pack(anchor="w", padx=10, pady=(10, 5))
            ctk.CTkLabel(step_frame, text=desc, font=FONT_LABEL, wraplength=350, justify="left").pack(anchor="w", padx=10, pady=(0, 10))
            
            # Load Image
            try:
                img_path = os.path.join(PATH_IMAGES, img_name)
                if os.path.exists(img_path):
                    pil_img = Image.open(img_path)
                    w, h = pil_img.size
                    ratio = h / w
                    target_w = 380
                    target_h = int(target_w * ratio)
                    
                    ctk_img = ctk.CTkImage(light_image=pil_img, dark_image=pil_img, size=(target_w, target_h))
                    
                    img_lbl = ctk.CTkLabel(step_frame, image=ctk_img, text="")
                    img_lbl.pack(pady=10)
                else:
                    ctk.CTkLabel(step_frame, text=f"[Image not found: {img_name}]", text_color="red").pack()
            except Exception as e:
                ctk.CTkLabel(step_frame, text=f"[Error: {e}]", text_color="red").pack()

        # 2. Configuration Form (Right Column)
        form_container = ctk.CTkFrame(t_comm, fg_color="transparent")
        form_container.grid(row=0, column=1, sticky="nsew", padx=(10, 0))
        
        ctk.CTkLabel(form_container, text="Configuration", font=FONT_HEADER).pack(anchor="w", pady=(0, 20))
        
        # We need to access self.data["site"]["comments"]["giscus"]
        if "comments" not in self.data.get("site", {}):
            if "site" not in self.data: self.data["site"] = {}
            self.data["site"]["comments"] = {"provider": "giscus", "giscus": {}}
        
        g_conf = self.data["site"]["comments"].get("giscus", {})
        
        self.comm_repo = LabeledEntry(form_container, "Repository (owner/name)")
        self.comm_repo.set(g_conf.get("repo", ""))
        self.comm_repo.pack(fill="x", pady=10)
        
        self.comm_repo_id = LabeledEntry(form_container, "Repository ID (R_...)")
        self.comm_repo_id.set(g_conf.get("repoId", ""))
        self.comm_repo_id.pack(fill="x", pady=10)
        
        self.comm_cat = LabeledEntry(form_container, "Category Name")
        self.comm_cat.set(g_conf.get("category", ""))
        self.comm_cat.pack(fill="x", pady=10)

        self.comm_cat_id = LabeledEntry(form_container, "Category ID (DIC_...)")
        self.comm_cat_id.set(g_conf.get("categoryId", ""))
        self.comm_cat_id.pack(fill="x", pady=10)
        
        ctk.CTkLabel(form_container, text="Note: Additional settings (mapping, strict mode, etc) are currently using secure defaults.", font=("Segoe UI", 11), text_color="gray").pack(pady=20, anchor="w")
        
        # Additional settings (Hardcoded for now based on user request "strict=0", but editable if needed?)
        # For simplicity, just the main IDs are critical.
        
        # --- Languages Tab ---
        t_lang = tabview.tab("Languages")
        
        # Manage Supported Languages
        ctk.CTkLabel(t_lang, text="Supported Languages", font=FONT_SUBHEADER).pack(anchor="w", pady=(10, 5))
        self.lang_list_frame = ctk.CTkFrame(t_lang)
        self.lang_list_frame.pack(fill="x", pady=5)
        self.refresh_supported_languages()

        add_lang_frame = ctk.CTkFrame(t_lang)
        add_lang_frame.pack(fill="x", pady=5)
        self.new_lang_code = ctk.CTkEntry(add_lang_frame, placeholder_text="Code (e.g. 'fr')")
        self.new_lang_code.pack(side="left", padx=5)
        ctk.CTkButton(add_lang_frame, text="Add Language", command=self.add_supported_language).pack(side="left", padx=5)

        ctk.CTkLabel(t_lang, text="Translation Keys", font=FONT_SUBHEADER).pack(anchor="w", pady=(20, 10))
        
        self.trans_container = ctk.CTkScrollableFrame(t_lang, fg_color="transparent", height=400)
        self.trans_container.pack(fill="both", expand=True)

        # Add New Key Area
        add_frame = ctk.CTkFrame(t_lang)
        add_frame.pack(fill="x", pady=10)
        self.new_key_entry = ctk.CTkEntry(add_frame, placeholder_text="New Key Name (e.g. 'contactTitle')")
        self.new_key_entry.pack(side="left", fill="x", expand=True, padx=5)
        ctk.CTkButton(add_frame, text="+ Add Key", width=80, command=self.add_translation_key).pack(side="left", padx=5)

        self.refresh_translations()
        
        # --- Images Tab ---
        t_img = tabview.tab("Images")
        ctk.CTkLabel(t_img, text="Favicon & PWA Icons", font=FONT_SUBHEADER).pack(anchor="w", pady=10)
        
        ctk.CTkLabel(t_img, text="Manage site icons. For full PWA support, generate assets using PWABuilder.", text_color="gray").pack(anchor="w")
        link_lbl = ctk.CTkLabel(t_img, text="https://www.pwabuilder.com/imageGenerator", text_color="#3498db", cursor="hand2")
        link_lbl.pack(anchor="w", pady=(0, 10))
        link_lbl.bind("<Button-1>", lambda e: os.system("start https://www.pwabuilder.com/imageGenerator"))

        img_btn_frame = ctk.CTkFrame(t_img, fg_color="transparent")
        img_btn_frame.pack(fill="x", pady=10)

        ctk.CTkButton(img_btn_frame, text="Upload Favicon (Direct)", command=self.upload_favicon_direct).pack(side="left", padx=5)
        ctk.CTkButton(img_btn_frame, text="Upload PWA ZIP (from PWABuilder)", command=self.upload_pwa_zip).pack(side="left", padx=5)

        # --- PWA Manifest Tab ---
        self.setup_pwa_manifest(tabview.tab("PWA Manifest"))

        # --- External Links Tab ---
        t_ext = tabview.tab("External Links")
        ctk.CTkLabel(t_ext, text="Navbar External Links (site.external)", font=FONT_SUBHEADER).pack(anchor="w", pady=10)
        
        ext_actions = ctk.CTkFrame(t_ext, fg_color="transparent")
        ext_actions.pack(fill="x", pady=5)
        
        ctk.CTkButton(ext_actions, text="+ Add Empty Link", command=self.add_ext_link).pack(side="left", padx=5)
        ctk.CTkButton(ext_actions, text="Upload Page & Add Link", fg_color="#8e44ad", command=self.upload_ext_page).pack(side="left", padx=5)

        self.ext_links_container = ctk.CTkFrame(t_ext, fg_color="transparent")
        self.ext_links_container.pack(fill="x", pady=10)
        self.refresh_ext_links()

        # --- Swipeable Routes Tab ---
        self.setup_swipeable_routes(tabview.tab("Swipeable Routes"))

    def upload_favicon_direct(self):
        file_path = filedialog.askopenfilename(filetypes=[("Image files", "*.png;*.ico;*.jpg;*.jpeg")])
        if file_path:
            try:
                dest = os.path.join(PATH_CLIENT_PUBLIC, "favicon.png")
                shutil.copy2(file_path, dest)
                messagebox.showinfo("Success", "Favicon updated successfully!")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to upload favicon: {e}")

    def upload_pwa_zip(self):
        file_path = filedialog.askopenfilename(filetypes=[("ZIP files", "*.zip")])
        if file_path:
            try:
                with zipfile.ZipFile(file_path, 'r') as zip_ref:
                    # Extract to temp or directly? User said "extract on the site configuration".
                    # Usually PWABuilder zip has 'manifest.json' and 'images/' (or 'icons/').
                    # We extract to client/public
                    zip_ref.extractall(PATH_CLIENT_PUBLIC)
                
                # Auto-update favicon.png from extracted assets if available
                # Common PWABuilder path: android/android-launchericon-512-512.png
                possible_icons = [
                    os.path.join(PATH_CLIENT_PUBLIC, "android", "android-launchericon-512-512.png"),
                    os.path.join(PATH_CLIENT_PUBLIC, "android", "android-launchericon-192-192.png"),
                    os.path.join(PATH_CLIENT_PUBLIC, "windows11", "Square150x150Logo.scale-200.png"),
                    os.path.join(PATH_CLIENT_PUBLIC, "ios", "180.png")
                ]
                
                dest_favicon = os.path.join(PATH_CLIENT_PUBLIC, "favicon.png")
                
                for icon_path in possible_icons:
                    if os.path.exists(icon_path):
                        shutil.copy2(icon_path, dest_favicon)
                        break
                
                messagebox.showinfo("Success", "PWA assets extracted and favicon updated.")
            except Exception as e:
                messagebox.showerror("Error", f"Failed to extract ZIP: {e}")

    def upload_ext_page(self):
        file_path = filedialog.askopenfilename(filetypes=[("Markdown files", "*.md"), ("All files", "*.*")])
        if file_path:
            try:
                filename = os.path.basename(file_path)
                dest = os.path.join(PATH_CLIENT_DATA, filename)
                shutil.copy2(file_path, dest)
                
                # Add to external links
                if "site" not in self.data: self.data["site"] = {}
                if "external" not in self.data["site"]: self.data["site"]["external"] = []
                
                name_without_ext = os.path.splitext(filename)[0]
                new_link = {
                    "name": { l: name_without_ext for l in self.get_languages() },
                    "url": f"/page/{name_without_ext}"
                }
                
                self.data["site"]["external"].append(new_link)
                self.refresh_ext_links()
                messagebox.showinfo("Success", f"Uploaded {filename} and added link.")
                
            except Exception as e:
                messagebox.showerror("Error", f"Failed to upload page: {e}")

    def refresh_supported_languages(self):
        for w in self.lang_list_frame.winfo_children():
            w.destroy()
        
        langs = self.get_languages()
        for idx, lang in enumerate(langs):
            c = ctk.CTkFrame(self.lang_list_frame)
            c.pack(side="left", padx=5, pady=5)
            ctk.CTkLabel(c, text=lang.upper(), font=("Consolas", 12, "bold")).pack(side="left", padx=5)
            if len(langs) > 1: # Prevent deleting last lang
                ctk.CTkButton(c, text="x", width=20, height=20, fg_color="#e74c3c", 
                              command=lambda l=lang: self.remove_supported_language(l)).pack(side="left", padx=2)

    def add_supported_language(self):
        code = self.new_lang_code.get().strip().lower()
        if not code: return
        langs = self.get_languages()
        if code not in langs:
            langs.append(code)
            if "site" not in self.data: self.data["site"] = {}
            self.data["site"]["languages"] = langs
            self.new_lang_code.delete(0, "end")
            self.refresh_supported_languages()
            self.refresh_translations() # Re-render translation rows with new column
            messagebox.showinfo("Wait", "Please restart the application to apply language column changes to other tabs.")
    
    def remove_supported_language(self, lang):
        if messagebox.askyesno("Confirm", f"Remove language '{lang}'? Data in this language will be preserved in JSON but hidden."):
            langs = self.get_languages()
            if lang in langs:
                 langs.remove(lang)
                 self.data["site"]["languages"] = langs
                 self.refresh_supported_languages()
                 self.refresh_translations()
                 messagebox.showinfo("Wait", "Please restart the application to apply changes fully.")

    def refresh_translations(self):
        for w in self.trans_container.winfo_children():
            w.destroy()

        if "translations" not in self.data:
            self.data["translations"] = {}

        # Sort keys for easier navigation
        keys = sorted(self.data["translations"].keys())

        for key in keys:
            self.create_trans_row(key)

    def create_trans_row(self, key):
        row = ctk.CTkFrame(self.trans_container)
        row.pack(fill="x", pady=2)
        
        # Key Label
        ctk.CTkLabel(row, text=key, font=("Consolas", 12), width=150, anchor="w").pack(side="left", padx=10)
        
        val = self.data["translations"][key]
        langs = self.get_languages()
        
        # Ensure we don't clear old data randomly, but dict `val` holds it.
        
        for lang in langs:
             entry = ctk.CTkEntry(row, placeholder_text=lang.upper(), width=100)
             entry.insert(0, val.get(lang, ""))
             entry.pack(side="left", fill="x", expand=True, padx=2)
             
             # Bind
             def update_t(k=key, l=lang, e=entry):
                 if k not in self.data["translations"]: self.data["translations"][k] = {}
                 self.data["translations"][k][l] = e.get()
             
             entry.bind("<KeyRelease>", lambda e, k=key, l=lang, ent=entry: update_t(k, l, ent))

        # Delete
        ctk.CTkButton(row, text="X", width=30, fg_color="#e74c3c", 
                      command=lambda k=key: self.delete_translation(k)).pack(side="right", padx=5)

    def add_translation_key(self):
        new_key = self.new_key_entry.get().strip()
        if not new_key:
            messagebox.showwarning("Warning", "Please enter a key name.")
            return
            
        if "translations" not in self.data:
            self.data["translations"] = {}
            
        if new_key in self.data["translations"]:
            messagebox.showerror("Error", "Key already exists!")
            return
            
        self.data["translations"][new_key] = {"en": "", "ar": ""}
        self.new_key_entry.delete(0, "end")
        self.refresh_translations()

    def delete_translation(self, key):
        if messagebox.askyesno("Confirm", f"Delete translation key '{key}'?"):
            del self.data["translations"][key]
            self.refresh_translations()

    def refresh_ext_links(self):
        for w in self.ext_links_container.winfo_children():
            w.destroy()
        
        links = self.data.get("site", {}).get("external", [])
        for i, link in enumerate(links):
            row = ctk.CTkFrame(self.ext_links_container)
            row.pack(fill="x", pady=5)
            row.grid_columnconfigure(1, weight=1)
            
            # Name (Multilingual)
            name_frames = MultilingualEntry(row, "Label", languages=self.get_languages(), width=300)
            name_frames.set(link.get("name"))
            name_frames.grid(row=0, column=0, padx=5)
            
            # URL
            url_entry = ctk.CTkEntry(row, placeholder_text="/page/...")
            url_entry.insert(0, link.get("url", ""))
            url_entry.grid(row=0, column=1, sticky="ew", padx=5)
            
            # Bindings
            def update_ext_link(idx=i, nf=name_frames, ue=url_entry):
                self.data["site"]["external"][idx]["name"] = nf.get()
                self.data["site"]["external"][idx]["url"] = ue.get()
                
            name_frames.bind_change(lambda x: update_ext_link())
            url_entry.bind("<KeyRelease>", lambda x: update_ext_link())

            ctk.CTkButton(row, text="X", width=30, fg_color="#e74c3c", 
                          command=lambda idx=i: self.delete_ext_link(idx)).grid(row=0, column=2, padx=5)

    def add_ext_link(self):
        if "site" not in self.data: self.data["site"] = {}
        if "external" not in self.data["site"]: self.data["site"]["external"] = []
        
        langs = self.get_languages()
        name_dict = {l: ("New Link" if l == 'en' else f"New Link ({l})") for l in langs}
        
        self.data["site"]["external"].append({"name": name_dict, "url": "#"})
        self.refresh_ext_links()

    def delete_ext_link(self, idx):
        self.data["site"]["external"].pop(idx)
        self.refresh_ext_links()

    # --- BLOG (Enhanced) ---
    def setup_blog(self):
        # Split layout: List on Left (1/3), Editor on Right (2/3)
        self.frame_blog.grid_columnconfigure(0, weight=1) # List
        self.frame_blog.grid_columnconfigure(1, weight=3) # Editor
        self.frame_blog.grid_rowconfigure(0, weight=1)

        # Left Column: Post List
        list_container = ctk.CTkFrame(self.frame_blog, corner_radius=0)
        list_container.grid(row=0, column=0, sticky="nsew", padx=(0, 10))
        list_container.grid_rowconfigure(1, weight=1)
        list_container.grid_columnconfigure(0, weight=1)

        ctk.CTkLabel(list_container, text="Posts", font=FONT_SUBHEADER).grid(row=0, column=0, padx=10, pady=10, sticky="w")
        self.post_scroll = ctk.CTkScrollableFrame(list_container, fg_color="transparent")
        self.post_scroll.grid(row=1, column=0, sticky="nsew", padx=5, pady=5)

        add_btn = ctk.CTkButton(list_container, text="+ New Post", command=self.add_post)
        add_btn.grid(row=2, column=0, padx=10, pady=10, sticky="ew")

        # Right Column: Editor
        self.editor_container = ctk.CTkScrollableFrame(self.frame_blog, corner_radius=10)
        self.editor_container.grid(row=0, column=1, sticky="nsew")

        self.refresh_blog_list()
        # Select first post if exists
        posts = self.data.get("blog", {}).get("posts", [])
        if posts:
            self.load_post_into_editor(posts[0])

    def refresh_blog_list(self):
        for widget in self.post_scroll.winfo_children():
            widget.destroy()
        
        posts = self.data.get("blog", {}).get("posts", [])
        for post in posts:
            self.create_post_card(post)

    def create_post_card(self, post):
        card = ctk.CTkFrame(self.post_scroll, border_width=1, border_color="gray30")
        card.pack(fill="x", pady=4)
        
        # Title
        title = post.get("title", {}).get("en", "Untitled")
        lbl = ctk.CTkLabel(card, text=title, font=("Segoe UI", 12, "bold"), anchor="w")
        lbl.pack(fill="x", padx=5, pady=(5,0))
        
        # Date
        date = post.get("date", "No Date")
        ctk.CTkLabel(card, text=date, font=("Segoe UI", 10), text_color="gray", anchor="w").pack(fill="x", padx=5, pady=(0, 5))

        # Make clicking the card load the post
        card.bind("<Button-1>", lambda e, p=post: self.load_post_into_editor(p))
        lbl.bind("<Button-1>", lambda e, p=post: self.load_post_into_editor(p))

    def load_post_into_editor(self, post):
        if self.current_post:
            self.save_current_post_edits()
        
        self.current_post = post
        
        # Clear Editor
        for widget in self.editor_container.winfo_children():
            widget.destroy()

        # Header
        header_frame = ctk.CTkFrame(self.editor_container, fg_color="transparent")
        header_frame.pack(fill="x", pady=10)
        ctk.CTkLabel(header_frame, text="Editing Post", font=FONT_HEADER).pack(side="left")
        
        del_btn = ctk.CTkButton(header_frame, text="Delete Post", fg_color="#e74c3c", width=100,
                                command=lambda: self.delete_current_post())
        del_btn.pack(side="right")

        # Fields
        self.edit_id = LabeledEntry(self.editor_container, "ID (Slug)")
        self.edit_id.set(post.get("id"))
        self.edit_id.pack(fill="x", pady=5)
        self.edit_id.bind_change(lambda v: self.update_post_field("id", v))
        self.edit_id.enable_context_menu()
        
        self.edit_date = LabeledEntry(self.editor_container, "Date")
        self.edit_date.set(post.get("date"))
        self.edit_date.pack(fill="x", pady=5)
        self.edit_date.bind_change(lambda v: self.update_post_field("date", v))
        self.edit_date.enable_context_menu()

        # Multilingual Fields
        langs = self.get_languages()

        self.edit_title = MultilingualEntry(self.editor_container, "Title", languages=langs)
        self.edit_title.set(post.get("title"))
        self.edit_title.pack(fill="x", pady=5)
        self.edit_title.bind_change(lambda v: self.update_post_field("title", v))
        self.edit_title.enable_context_menu()

        self.edit_excerpt = MultilingualEntry(self.editor_container, "Excerpt", languages=langs)
        self.edit_excerpt.set(post.get("excerpt"))
        self.edit_excerpt.pack(fill="x", pady=5)
        self.edit_excerpt.bind_change(lambda v: self.update_post_field("excerpt", v))
        self.edit_excerpt.enable_context_menu()

        self.edit_tags = LabeledEntry(self.editor_container, "Tags (comma separated)")
        self.edit_tags.set(", ".join(post.get("tags", [])))
        self.edit_tags.pack(fill="x", pady=5)
        self.edit_tags.bind_change(lambda v: self.update_post_field("tags", [t.strip() for t in v.split(",") if t.strip()]))
        self.edit_tags.enable_context_menu()

        # Options Row
        opts_frame = ctk.CTkFrame(self.editor_container, fg_color="transparent")
        opts_frame.pack(fill="x", pady=5)

        # Pin
        self.pin_var = ctk.BooleanVar(value=post.get("pin", False))
        ctk.CTkCheckBox(opts_frame, text="Pin Post", variable=self.pin_var, 
                        command=lambda: self.update_post_field("pin", self.pin_var.get())).pack(side="left", padx=(0, 20))

        # Check for Encoding State
        raw_content = post.get("content", "")
        was_encoded = post.get("encoding", False)
        
        # Helper detection checks
        decoded_text = raw_content
        
        if not was_encoded and len(raw_content) > 0:
            # Auto-detect Base64 (heuristic)
            try:
                candidate_bytes = base64.b64decode(raw_content)
                candidate_str = candidate_bytes.decode('utf-8')
                
                # Ensure line endings are normalized
                candidate_str = candidate_str.replace('\r\n', '\n')
                
                decoded_text = candidate_str
                was_encoded = True
                post["encoding"] = True
            except:
                pass
        elif was_encoded:
            try:
                candidate_bytes = base64.b64decode(raw_content)
                candidate_str = candidate_bytes.decode('utf-8')
                candidate_str = candidate_str.replace('\r\n', '\n')
                decoded_text = candidate_str
            except Exception as e:
                decoded_text = f"Error decoding: {e}\n\n{raw_content}"

        # Encoding Toggle
        self.is_encoded_var = ctk.BooleanVar(value=was_encoded)
        ctk.CTkCheckBox(opts_frame, text="Encode Content (Base64)", variable=self.is_encoded_var, 
                        command=self.toggle_encoding).pack(side="left")

        ctk.CTkLabel(self.editor_container, text="Content (Markdown)", font=FONT_LABEL).pack(anchor="w", pady=(10,0))
        self.edit_content = ctk.CTkTextbox(self.editor_container, height=400, font=FONT_MONO)
        self.edit_content.pack(fill="x", pady=5)
        
        # Insert the resolved text
        self.edit_content.insert("1.0", decoded_text)
        
        # Context Menu for Textbox
        self.create_context_menu(self.edit_content._textbox)
        
        # Content auto-save binding
        self.edit_content.bind("<KeyRelease>", lambda e: self.save_current_content())

    def update_post_field(self, key, value):
        if self.current_post:
            self.current_post[key] = value

    def create_context_menu(self, widget):
        menu = tkinter.Menu(widget, tearoff=0)
        menu.add_command(label="Cut", command=lambda: widget.event_generate("<<Cut>>"))
        menu.add_command(label="Copy", command=lambda: widget.event_generate("<<Copy>>"))
        menu.add_command(label="Paste", command=lambda: widget.event_generate("<<Paste>>"))
        menu.add_separator()
        menu.add_command(label="Select All", command=lambda: widget.event_generate("<<SelectAll>>"))
        widget.bind("<Button-3>", lambda e: menu.tk_popup(e.x_root, e.y_root))

    def save_current_content(self):
        if self.current_post:
            content = self.edit_content.get("1.0", "end").strip()
            
            if self.is_encoded_var.get():
                try:
                    # STRICT Base64 encoding (No URL Quote)
                    # This ensures cleanest data and no "escaped char" confusion
                    encoded = base64.b64encode(content.encode('utf-8')).decode('utf-8')
                    self.current_post["content"] = encoded
                    self.current_post["encoding"] = True
                except:
                     self.current_post["content"] = content
                     self.current_post["encoding"] = False 
            else:
                self.current_post["content"] = content
                self.current_post["encoding"] = False

    def toggle_encoding(self):
        # Trigger save to re-process content based on new checkbox state
        self.save_current_content()

    def save_current_post_edits(self):
        if not self.current_post: return
        self.save_current_content()

    def add_post(self):
        langs = self.get_languages()
        
        # Initial empty values for all configured languages
        title_dict = {l: (f"New Post ({l.upper()})" if l == 'en' else f"New Post ({l})") for l in langs}
        excerpt_dict = {l: "Summary..." for l in langs}
        
        new_post = {
            "id": "new-post-" + datetime.now().strftime("%Y%m%d%H%M%S"),
            "date": datetime.now().strftime("%B %d, %Y"),
            "title": title_dict,
            "excerpt": excerpt_dict,
            "content": "# Content",
            "tags": [],
            "pin": False
        }
        if "blog" not in self.data:
            self.data["blog"] = {"posts": []}
        if "posts" not in self.data["blog"]:
            self.data["blog"]["posts"] = []
            
        self.data["blog"]["posts"].insert(0, new_post)
        self.refresh_blog_list()
        self.load_post_into_editor(new_post)

    def delete_current_post(self):
        if messagebox.askyesno("Confirm", "Delete this post?"):
            self.data["blog"]["posts"].remove(self.current_post)
            self.current_post = None
            self.refresh_blog_list()
            # Clear editor
            for widget in self.editor_container.winfo_children():
                widget.destroy()

    # --- ACHIEVEMENTS ---
    def setup_achievements(self):
        f = self.frame_achievements
        ctk.CTkLabel(f, text="Achievements", font=FONT_HEADER).pack(anchor="w", pady=(0, 20))
        self.ach_container = ctk.CTkFrame(f, fg_color="transparent")
        self.ach_container.pack(fill="x")
        self.refresh_achievements()
        ctk.CTkButton(f, text="+ Add Achievement", command=self.add_achievement).pack(pady=20)
        
        # Restore normal save wrapper
        self.save_btn.configure(command=self.global_save_wrapper)

    def refresh_achievements(self):
        for w in self.ach_container.winfo_children():
            w.destroy()
            
        achs = self.data.get("achievements", [])
        for i, ach in enumerate(achs):
            self.create_ach_row(i, ach)

    def create_ach_row(self, idx, ach):
        row = ctk.CTkFrame(self.ach_container)
        row.pack(fill="x", pady=5)
        
        row.grid_columnconfigure(1, weight=1)
        
        ctk.CTkLabel(row, text=f"#{idx+1}", width=30).grid(row=0, column=0, padx=5)
        
        f_title = MultilingualEntry(row, "Title", languages=self.get_languages())
        f_title.set(ach.get("title"))
        f_title.grid(row=0, column=1, sticky="ew", padx=5)
        
        f_sub = MultilingualEntry(row, "Subtitle", languages=self.get_languages())
        f_sub.set(ach.get("subtitle"))
        f_sub.grid(row=1, column=1, sticky="ew", padx=5)
        
        # Real-time binding
        def update_ach(data, key):
            ach[key] = data
            
        f_title.bind_change(lambda d: update_ach(d, "title"))
        f_sub.bind_change(lambda d: update_ach(d, "subtitle"))
        
        ctk.CTkButton(row, text="DEL", width=40, fg_color="#e74c3c", 
                      command=lambda: self.delete_ach(idx)).grid(row=0, column=2, rowspan=2, padx=5)

    def add_achievement(self):
        if "achievements" not in self.data:
            self.data["achievements"] = []
        
        # Init with all langs
        langs = self.get_languages()
        t_dict = {l: "New" for l in langs}
        s_dict = {l: "Desc" for l in langs}
        
        self.data["achievements"].append({"title": t_dict, "subtitle": s_dict, "fallback": "#"})
        self.refresh_achievements()

    def delete_ach(self, idx):
        self.data["achievements"].pop(idx)
        self.refresh_achievements()

    # --- SWIPEABLE ROUTES ---
    def setup_swipeable_routes(self, parent_frame):
        ctk.CTkLabel(parent_frame, text="Swipeable Routes", font=FONT_HEADER).pack(anchor="w", pady=(0, 10))
        ctk.CTkLabel(parent_frame, text="Define which routes support swipe navigation.", text_color="gray").pack(anchor="w", pady=(0, 10))

        # Check for existing data
        if "site" not in self.data: self.data["site"] = {}
        if "swipeableRoutes" not in self.data["site"]: self.data["site"]["swipeableRoutes"] = ["/"]
        
        routes = self.data["site"]["swipeableRoutes"]
        
        # "All" checkbox logic
        self.swipe_all_var = ctk.BooleanVar(value=("*" in routes))
        
        def toggle_all():
            if self.swipe_all_var.get():
                self.data["site"]["swipeableRoutes"] = ["*"]
                self.refresh_swipe_routes() 
            else:
                self.data["site"]["swipeableRoutes"] = ["/"]
                self.refresh_swipe_routes() 

        ctk.CTkCheckBox(parent_frame, text="Enable for All Routes (*)", variable=self.swipe_all_var, command=toggle_all).pack(anchor="w", pady=10)
        
        self.swipe_list_frame = ctk.CTkScrollableFrame(parent_frame, fg_color="transparent")
        self.swipe_list_frame.pack(fill="both", expand=True)
        
        self.refresh_swipe_routes()

    def refresh_swipe_routes(self):
        for w in self.swipe_list_frame.winfo_children():
            w.destroy()
            
        routes = self.data["site"].get("swipeableRoutes", [])
        
        if "*" in routes:
             ctk.CTkLabel(self.swipe_list_frame, text="All routes are swipeable.", text_color="#2ecc71").pack(pady=20)
             return

        # List specific routes
        for i, route in enumerate(routes):
            row = ctk.CTkFrame(self.swipe_list_frame)
            row.pack(fill="x", pady=5)
            
            entry = ctk.CTkEntry(row, placeholder_text="/route")
            entry.insert(0, route)
            entry.pack(side="left", fill="x", expand=True, padx=5)
            
            def update_r(val, idx=i):
                 # Ensure we are updating the list in place
                 if idx < len(self.data["site"]["swipeableRoutes"]):
                    self.data["site"]["swipeableRoutes"][idx] = val
            
            # Using simple lambda binding (careful with closure)
            entry.bind("<KeyRelease>", lambda e, idx=i, ent=entry: update_r(ent.get(), idx))
            
            ctk.CTkButton(row, text="X", width=30, fg_color="#e74c3c", 
                          command=lambda idx=i: self.delete_swipe_route(idx)).pack(side="right", padx=5)

        ctk.CTkButton(self.swipe_list_frame, text="+ Add Route", command=self.add_swipe_route).pack(pady=10)

    def add_swipe_route(self):
         self.data["site"]["swipeableRoutes"].append("")
         self.refresh_swipe_routes()

    def delete_swipe_route(self, idx):
         self.data["site"]["swipeableRoutes"].pop(idx)
         self.refresh_swipe_routes()

    # --- PWA MANIFEST ---
    def setup_pwa_manifest(self, parent_frame):
        ctk.CTkLabel(parent_frame, text="PWA Manifest Configuration", font=FONT_HEADER).pack(anchor="w", pady=(0, 20))
        
        tabview = ctk.CTkTabview(parent_frame)
        tabview.pack(fill="both", expand=True)

        tabview.add("General")
        tabview.add("Icons")
        tabview.add("Screenshots")
        tabview.add("Shortcuts")
        tabview.add("Advanced")

        # --- General Tab ---
        t_gen = tabview.tab("General")
        scroll_gen = ctk.CTkScrollableFrame(t_gen, fg_color="transparent")
        scroll_gen.pack(fill="both", expand=True)

        ctk.CTkLabel(scroll_gen, text="Basic Information", font=FONT_SUBHEADER, text_color="#3498db").pack(anchor="w", pady=10)
        
        self.pwa_name = LabeledEntry(scroll_gen, "App Name")
        self.pwa_name.set(self.manifest_data.get("name", ""))
        self.pwa_name.pack(fill="x", pady=5)
        self.pwa_name.bind_change(lambda v: self.update_manifest_field("name", v))

        self.pwa_short_name = LabeledEntry(scroll_gen, "Short Name")
        self.pwa_short_name.set(self.manifest_data.get("short_name", ""))
        self.pwa_short_name.pack(fill="x", pady=5)
        self.pwa_short_name.bind_change(lambda v: self.update_manifest_field("short_name", v))

        self.pwa_description = LabeledEntry(scroll_gen, "Description")
        self.pwa_description.set(self.manifest_data.get("description", ""))
        self.pwa_description.pack(fill="x", pady=5)
        self.pwa_description.bind_change(lambda v: self.update_manifest_field("description", v))

        colors_frame = ctk.CTkFrame(scroll_gen, fg_color="transparent")
        colors_frame.pack(fill="x", pady=10)
        
        self.pwa_bg_color = LabeledEntry(colors_frame, "Background Color")
        self.pwa_bg_color.set(self.manifest_data.get("background_color", "#ffffff"))
        self.pwa_bg_color.pack(side="left", fill="x", expand=True, padx=(0, 5))
        self.pwa_bg_color.bind_change(lambda v: self.update_manifest_field("background_color", v))

        self.pwa_theme_color = LabeledEntry(colors_frame, "Theme Color")
        self.pwa_theme_color.set(self.manifest_data.get("theme_color", "#ffffff"))
        self.pwa_theme_color.pack(side="left", fill="x", expand=True, padx=(5, 0))
        self.pwa_theme_color.bind_change(lambda v: self.update_manifest_field("theme_color", v))

        lang_frame = ctk.CTkFrame(scroll_gen, fg_color="transparent")
        lang_frame.pack(fill="x", pady=10)
        
        self.pwa_lang = LabeledEntry(lang_frame, "Language (e.g. en, ar)")
        self.pwa_lang.set(self.manifest_data.get("lang", "en"))
        self.pwa_lang.pack(side="left", fill="x", expand=True, padx=(0, 5))
        self.pwa_lang.bind_change(lambda v: self.update_manifest_field("lang", v))

        self.pwa_dir = LabeledEntry(lang_frame, "Direction (ltr, rtl)")
        self.pwa_dir.set(self.manifest_data.get("dir", "ltr"))
        self.pwa_dir.pack(side="left", fill="x", expand=True, padx=(5, 0))
        self.pwa_dir.bind_change(lambda v: self.update_manifest_field("dir", v))

        self.pwa_categories = LabeledEntry(scroll_gen, "Categories (comma separated)")
        self.pwa_categories.set(", ".join(self.manifest_data.get("categories", [])))
        self.pwa_categories.pack(fill="x", pady=5)
        self.pwa_categories.bind_change(lambda v: self.update_manifest_field("categories", [c.strip() for c in v.split(",") if c.strip()]))

        # --- Icons Tab ---
        t_icons = tabview.tab("Icons")
        self.pwa_icons_container = ctk.CTkScrollableFrame(t_icons, fg_color="transparent")
        self.pwa_icons_container.pack(fill="both", expand=True, pady=10)
        self.refresh_pwa_icons()
        ctk.CTkButton(t_icons, text="+ Add Icon", command=self.add_pwa_icon, width=150).pack(pady=10)

        # --- Screenshots Tab ---
        t_ss = tabview.tab("Screenshots")
        self.pwa_screenshots_container = ctk.CTkScrollableFrame(t_ss, fg_color="transparent")
        self.pwa_screenshots_container.pack(fill="both", expand=True, pady=10)
        self.refresh_pwa_screenshots()
        ctk.CTkButton(t_ss, text="+ Add Screenshot", command=self.add_pwa_screenshot, width=150).pack(pady=10)

        # --- Shortcuts Tab ---
        t_sh = tabview.tab("Shortcuts")
        self.pwa_shortcuts_container = ctk.CTkScrollableFrame(t_sh, fg_color="transparent")
        self.pwa_shortcuts_container.pack(fill="both", expand=True, pady=10)
        self.refresh_pwa_shortcuts()
        ctk.CTkButton(t_sh, text="+ Add Shortcut", command=self.add_pwa_shortcut, width=150).pack(pady=10)

        # --- Advanced Tab ---
        t_adv = tabview.tab("Advanced")
        scroll_adv = ctk.CTkScrollableFrame(t_adv, fg_color="transparent")
        scroll_adv.pack(fill="both", expand=True)

        ctk.CTkLabel(scroll_adv, text="Advanced PWA Settings", font=FONT_SUBHEADER, text_color="#3498db").pack(anchor="w", pady=10)

        self.pwa_start_url = LabeledEntry(scroll_adv, "Start URL")
        self.pwa_start_url.set(self.manifest_data.get("start_url", "/"))
        self.pwa_start_url.pack(fill="x", pady=5)
        self.pwa_start_url.bind_change(lambda v: self.update_manifest_field("start_url", v))

        self.pwa_display = LabeledEntry(scroll_adv, "Display Mode")
        self.pwa_display.set(self.manifest_data.get("display", "standalone"))
        self.pwa_display.pack(fill="x", pady=5)
        self.pwa_display.bind_change(lambda v: self.update_manifest_field("display", v))

        self.pwa_orientation = LabeledEntry(scroll_adv, "Orientation")
        self.pwa_orientation.set(self.manifest_data.get("orientation", "any"))
        self.pwa_orientation.pack(fill="x", pady=5)
        self.pwa_orientation.bind_change(lambda v: self.update_manifest_field("orientation", v))

        self.pwa_scope = LabeledEntry(scroll_adv, "Scope")
        self.pwa_scope.set(self.manifest_data.get("scope", "/"))
        self.pwa_scope.pack(fill="x", pady=5)
        self.pwa_scope.bind_change(lambda v: self.update_manifest_field("scope", v))

        self.pwa_id = LabeledEntry(scroll_adv, "Unique ID")
        self.pwa_id.set(self.manifest_data.get("id", "/"))
        self.pwa_id.pack(fill="x", pady=5)
        self.pwa_id.bind_change(lambda v: self.update_manifest_field("id", v))

    def upload_image_to_path(self, subfolder="icons"):
        """Helper to upload an image and return web-relative path"""
        file_path = filedialog.askopenfilename(filetypes=[("Image files", "*.png;*.jpg;*.jpeg;*.svg;*.webp;*.ico")])
        if file_path:
            try:
                dest_dir = os.path.join(PATH_CLIENT_PUBLIC, subfolder)
                os.makedirs(dest_dir, exist_ok=True)
                
                filename = os.path.basename(file_path)
                dest_path = os.path.join(dest_dir, filename)
                shutil.copy2(file_path, dest_path)
                
                return f"/{subfolder}/{filename}" if subfolder else f"/{filename}"
            except Exception as e:
                messagebox.showerror("Error", f"Failed to upload image: {e}")
        return None

    def update_manifest_field(self, key, value):
        self.manifest_data[key] = value

    def refresh_pwa_icons(self):
        for w in self.pwa_icons_container.winfo_children():
            w.destroy()
        
        icons = self.manifest_data.get("icons", [])
        for i, icon in enumerate(icons):
            row = ctk.CTkFrame(self.pwa_icons_container)
            row.pack(fill="x", pady=5)
            
            # Icon Fields: src, sizes, type, purpose
            f_src = ctk.CTkEntry(row, placeholder_text="Source (e.g. /icons/icon.png)", width=200)
            f_src.insert(0, icon.get("src", ""))
            f_src.pack(side="left", padx=5, pady=5, fill="x", expand=True)

            def upload_icon_btn(e=f_src, idx=i):
                path = self.upload_image_to_path("icons")
                if path:
                    e.delete(0, "end")
                    e.insert(0, path)
                    self.manifest_data["icons"][idx]["src"] = path

            ctk.CTkButton(row, text="Upload", width=60, command=upload_icon_btn).pack(side="left", padx=2)
            
            f_sizes = ctk.CTkEntry(row, placeholder_text="Sizes (e.g. 192x192)", width=100)
            f_sizes.insert(0, icon.get("sizes", ""))
            f_sizes.pack(side="left", padx=5, pady=5)
            
            f_type = ctk.CTkEntry(row, placeholder_text="Type (e.g. image/png)", width=100)
            f_type.insert(0, icon.get("type", "image/png"))
            f_type.pack(side="left", padx=5, pady=5)

            # Bindings
            def update_icon(idx=i, s=f_src, sz=f_sizes, t=f_type):
                self.manifest_data["icons"][idx]["src"] = s.get()
                self.manifest_data["icons"][idx]["sizes"] = sz.get()
                self.manifest_data["icons"][idx]["type"] = t.get()
            
            f_src.bind("<KeyRelease>", lambda e: update_icon())
            f_sizes.bind("<KeyRelease>", lambda e: update_icon())
            f_type.bind("<KeyRelease>", lambda e: update_icon())

            ctk.CTkButton(row, text="X", width=30, fg_color="#e74c3c", 
                          command=lambda idx=i: self.delete_pwa_icon(idx)).pack(side="right", padx=5)

    def add_pwa_icon(self):
        if "icons" not in self.manifest_data: self.manifest_data["icons"] = []
        self.manifest_data["icons"].append({"src": "", "sizes": "512x512", "type": "image/png", "purpose": "any"})
        self.refresh_pwa_icons()

    def delete_pwa_icon(self, idx):
        self.manifest_data["icons"].pop(idx)
        self.refresh_pwa_icons()

    def refresh_pwa_screenshots(self):
        for w in self.pwa_screenshots_container.winfo_children():
            w.destroy()
        
        screenshots = self.manifest_data.get("screenshots", [])
        for i, ss in enumerate(screenshots):
            row = ctk.CTkFrame(self.pwa_screenshots_container)
            row.pack(fill="x", pady=5)
            
            # Left side: Src & Label
            col1 = ctk.CTkFrame(row, fg_color="transparent")
            col1.pack(side="left", fill="x", expand=True)
            
            # Row 1: Source + Upload btn
            r1 = ctk.CTkFrame(col1, fg_color="transparent")
            r1.pack(fill="x")
            f_src = ctk.CTkEntry(r1, placeholder_text="Source URL")
            f_src.insert(0, ss.get("src", ""))
            f_src.pack(side="left", fill="x", expand=True, padx=(5, 2), pady=2)

            def upload_ss_btn(e=f_src, idx=i):
                path = self.upload_image_to_path("Presentation")
                if path:
                    e.delete(0, "end")
                    e.insert(0, path)
                    self.manifest_data["screenshots"][idx]["src"] = path

            ctk.CTkButton(r1, text="Upload", width=60, command=upload_ss_btn).pack(side="left", padx=2, pady=2)
            
            # Row 2: Label
            f_label = ctk.CTkEntry(col1, placeholder_text="Label / Description")
            f_label.insert(0, ss.get("label", ""))
            f_label.pack(fill="x", padx=5, pady=2)

            # Right side: Sizes & Form Factor
            col2 = ctk.CTkFrame(row, fg_color="transparent")
            col2.pack(side="left", padx=5)
            
            f_sizes = ctk.CTkEntry(col2, placeholder_text="Sizes", width=100)
            f_sizes.insert(0, ss.get("sizes", ""))
            f_sizes.pack(pady=2)
            
            f_ff = ctk.CTkOptionMenu(col2, values=["wide", "narrow"], width=100)
            f_ff.set(ss.get("form_factor", "wide"))
            f_ff.pack(pady=2)

            # Bindings
            def update_ss(idx=i, s=f_src, l=f_label, sz=f_sizes, ff=f_ff):
                self.manifest_data["screenshots"][idx]["src"] = s.get()
                self.manifest_data["screenshots"][idx]["label"] = l.get()
                self.manifest_data["screenshots"][idx]["sizes"] = sz.get()
                self.manifest_data["screenshots"][idx]["form_factor"] = ff.get()
            
            f_src.bind("<KeyRelease>", lambda e: update_ss())
            f_label.bind("<KeyRelease>", lambda e: update_ss())
            f_sizes.bind("<KeyRelease>", lambda e: update_ss())
            f_ff.configure(command=lambda e: update_ss())

            ctk.CTkButton(row, text="X", width=30, fg_color="#e74c3c", 
                          command=lambda idx=i: self.delete_pwa_screenshot(idx)).pack(side="right", padx=5)

    def add_pwa_screenshot(self):
        if "screenshots" not in self.manifest_data: self.manifest_data["screenshots"] = []
        self.manifest_data["screenshots"].append({"src": "", "sizes": "1920x1080", "type": "image/png", "form_factor": "wide", "label": ""})
        self.refresh_pwa_screenshots()

    def delete_pwa_screenshot(self, idx):
        self.manifest_data["screenshots"].pop(idx)
        self.refresh_pwa_screenshots()

    def refresh_pwa_shortcuts(self):
        for w in self.pwa_shortcuts_container.winfo_children():
            w.destroy()
        
        shortcuts = self.manifest_data.get("shortcuts", [])
        for i, sc in enumerate(shortcuts):
            row = ctk.CTkFrame(self.pwa_shortcuts_container)
            row.pack(fill="x", pady=5)
            
            col1 = ctk.CTkFrame(row, fg_color="transparent")
            col1.pack(side="left", fill="x", expand=True)
            
            f_name = ctk.CTkEntry(col1, placeholder_text="Full Name")
            f_name.insert(0, sc.get("name", ""))
            f_name.pack(fill="x", padx=5, pady=2)
            
            f_desc = ctk.CTkEntry(col1, placeholder_text="Description")
            f_desc.insert(0, sc.get("description", ""))
            f_desc.pack(fill="x", padx=5, pady=2)

            col2 = ctk.CTkFrame(row, fg_color="transparent")
            col2.pack(side="left", fill="x", expand=True)
            
            f_sname = ctk.CTkEntry(col2, placeholder_text="Short Name")
            f_sname.insert(0, sc.get("short_name", ""))
            f_sname.pack(fill="x", padx=5, pady=2)
            
            f_url = ctk.CTkEntry(col2, placeholder_text="URL (e.g. /about)")
            f_url.insert(0, sc.get("url", ""))
            f_url.pack(fill="x", padx=5, pady=2)

            # Icon for shortcut
            col3 = ctk.CTkFrame(row, fg_color="transparent")
            col3.pack(side="left", padx=5)
            
            icon_sc = sc.get("icons", [{}])[0].get("src", "/favicon.png")
            f_icon = ctk.CTkEntry(col3, placeholder_text="Icon URL", width=120)
            f_icon.insert(0, icon_sc)
            f_icon.pack(pady=2)

            def upload_sc_icon(e=f_icon, idx=i):
                path = self.upload_image_to_path("icons")
                if path:
                    e.delete(0, "end")
                    e.insert(0, path)
                    if "icons" not in self.manifest_data["shortcuts"][idx]:
                        self.manifest_data["shortcuts"][idx]["icons"] = [{"src": path, "sizes": "192x192"}]
                    else:
                        self.manifest_data["shortcuts"][idx]["icons"][0]["src"] = path

            ctk.CTkButton(col3, text="Upload Icon", width=100, command=upload_sc_icon).pack(pady=2)

            # Bindings
            def update_sc(idx=i, n=f_name, d=f_desc, sn=f_sname, u=f_url, ic=f_icon):
                sc_item = self.manifest_data["shortcuts"][idx]
                sc_item["name"] = n.get()
                sc_item["description"] = d.get()
                sc_item["short_name"] = sn.get()
                sc_item["url"] = u.get()
                if "icons" not in sc_item: sc_item["icons"] = [{"src": ic.get(), "sizes": "192x192"}]
                else: sc_item["icons"][0]["src"] = ic.get()
            
            f_name.bind("<KeyRelease>", lambda e: update_sc())
            f_desc.bind("<KeyRelease>", lambda e: update_sc())
            f_sname.bind("<KeyRelease>", lambda e: update_sc())
            f_url.bind("<KeyRelease>", lambda e: update_sc())
            f_icon.bind("<KeyRelease>", lambda e: update_sc())

            ctk.CTkButton(row, text="X", width=30, fg_color="#e74c3c", 
                          command=lambda idx=i: self.delete_pwa_shortcut(idx)).pack(side="right", padx=5)

    def add_pwa_shortcut(self):
        if "shortcuts" not in self.manifest_data: self.manifest_data["shortcuts"] = []
        self.manifest_data["shortcuts"].append({"name": "New Shortcut", "short_name": "New", "description": "", "url": "/", "icons": [{"src": "/favicon.png", "sizes": "192x192"}]})
        self.refresh_pwa_shortcuts()

    def delete_pwa_shortcut(self, idx):
        self.manifest_data["shortcuts"].pop(idx)
        self.refresh_pwa_shortcuts()

if __name__ == "__main__":
    app = DataManagerApp()
    app.mainloop()
