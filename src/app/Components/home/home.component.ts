import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HeaderMenus } from 'src/app/Models/header-menus.dto';
import { PostDTO } from 'src/app/Models/post.dto';
import { HeaderMenusService } from 'src/app/Services/header-menus.service';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  posts!: PostDTO[];
  filteredPosts!: PostDTO[];
  showButtons: boolean;
  
  // Filter properties
  searchText: string = '';
  authorFilter: string = '';
  dateFilter: string = 'all';
  constructor(
    private postService: PostService,
    private localStorageService: LocalStorageService,
    private sharedService: SharedService,
    private router: Router,
    private headerMenusService: HeaderMenusService
  ) {
    this.showButtons = false;
    this.loadPosts();
  }

  ngOnInit(): void {
    this.headerMenusService.headerManagement.subscribe(
      (headerInfo: HeaderMenus) => {
        if (headerInfo) {
          this.showButtons = headerInfo.showAuthSection;
        }
      }
    );
  }
  private async loadPosts(): Promise<void> {
    let errorResponse: any;
    
    const userId = this.localStorageService.get('user_id');
    if (userId) {
      this.showButtons = true;
    }

    try {
      this.posts = await this.postService.getPosts();
      this.filteredPosts = [...this.posts]; // Initialize filtered posts
    } catch (error: any) {
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse);
    }
  }

  applyFilters(): void {
    this.filteredPosts = this.posts.filter(post => {
      const matchesSearch = !this.searchText || 
        post.title.toLowerCase().includes(this.searchText.toLowerCase()) ||
        post.description.toLowerCase().includes(this.searchText.toLowerCase());

      const matchesAuthor = !this.authorFilter ||
        post.userAlias.toLowerCase().includes(this.authorFilter.toLowerCase());

      const matchesDate = this.checkDateFilter(new Date(post.publication_date));

      return matchesSearch && matchesAuthor && matchesDate;
    });
  }

  private checkDateFilter(postDate: Date): boolean {
    if (this.dateFilter === 'all') return true;

    const today = new Date();
    
    switch (this.dateFilter) {
      case 'today':
        return postDate.toDateString() === today.toDateString();
      
      case 'week':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return postDate >= weekAgo;
      
      case 'month':
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return postDate >= monthAgo;
      
      default:
        return true;
    }
  }

  // Make sure these methods are public
  public async like(postId: string): Promise<void> {
    let errorResponse: any;
    try {
      await this.postService.likePost(postId);
      this.loadPosts();
    } catch (error: any) {
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse);
    }
  }

  public async dislike(postId: string): Promise<void> {
    let errorResponse: any;
    try {
      await this.postService.dislikePost(postId);
      this.loadPosts();
    } catch (error: any) {
      errorResponse = error.error;
      this.sharedService.errorLog(errorResponse);
    }
  }
}