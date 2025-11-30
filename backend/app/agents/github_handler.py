import os
import shutil
import tempfile
import zipfile
from git import Repo
import validators
import stat

def on_rm_error(func, path, exc_info):
    """
    Error handler for ``shutil.rmtree``.

    If the error is due to an access error (read only file)
    it attempts to add write permission and then retries.

    If the error is for another reason it re-raises the error.
    Usage : ``shutil.rmtree(path, onerror=on_rm_error)``
    """
    # Is the error an access error?
    os.chmod(path, stat.S_IWRITE)
    func(path)

class GitHubHandler:
    """Agent for handling GitHub repository operations"""
    
    def __init__(self):
        pass
    
    def validate_github_url(self, url: str) -> bool:
        """Validate if the URL is a valid GitHub repository URL"""
        if not validators.url(url):
            return False
        return 'github.com' in url.lower()
    
    def clone_and_zip(self, github_url: str, token: str = None) -> str:
        """
        Clone a GitHub repository and convert it to a ZIP file
        
        Args:
            github_url: GitHub repository URL
            token: Optional GitHub Personal Access Token for private repos
            
        Returns:
            Path to the created ZIP file
        """
        # Create a unique temp directory for this specific request
        temp_dir = tempfile.mkdtemp(prefix="gh_req_")
        
        try:
            # Validate URL
            if not self.validate_github_url(github_url):
                raise ValueError("Invalid GitHub URL")
            
            # Extract repo name from URL
            repo_name = github_url.rstrip('/').split('/')[-1]
            if repo_name.endswith('.git'):
                repo_name = repo_name[:-4]
            
            # Construct Auth URL if token is provided
            auth_url = github_url
            if token:
                # Insert token into URL: https://token@github.com/user/repo
                if "https://" in github_url:
                    auth_url = github_url.replace("https://", f"https://{token}@")
                else:
                    # Fallback for non-https or other formats, though we expect https
                    auth_url = f"https://{token}@{github_url.replace('http://', '').replace('https://', '')}"

            # Clone repository
            clone_path = os.path.join(temp_dir, repo_name)
            print(f"Cloning repository from {github_url} into {clone_path}...")
            
            # Use the auth_url for cloning but don't log it to avoid leaking tokens
            Repo.clone_from(auth_url, clone_path, depth=1)  # Shallow clone for speed
            
            # Remove .git directory to reduce size
            git_dir = os.path.join(clone_path, '.git')
            if os.path.exists(git_dir):
                shutil.rmtree(git_dir, onerror=on_rm_error)
            
            # Create ZIP file
            zip_path = os.path.join("storage", "uploads", f"{repo_name}.zip")
            os.makedirs(os.path.dirname(zip_path), exist_ok=True)
            
            print(f"Creating ZIP file at {zip_path}...")
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for root, dirs, files in os.walk(clone_path):
                    for file in files:
                        file_path = os.path.join(root, file)
                        arcname = os.path.relpath(file_path, clone_path)
                        zipf.write(file_path, arcname)
            
            print(f"Successfully created ZIP file: {zip_path}")
            return zip_path
            
        except Exception as e:
            # Mask token in error message if present
            error_msg = str(e)
            if token:
                error_msg = error_msg.replace(token, "******")
            raise Exception(f"Failed to clone repository: {error_msg}")
        finally:
            # Cleanup the unique temp directory for this request
            if os.path.exists(temp_dir):
                try:
                    shutil.rmtree(temp_dir, onerror=on_rm_error)
                except:
                    pass  # Best effort cleanup
    
    def cleanup(self):
        """Clean up temporary files - No-op now as we clean up per request"""
        pass
