import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  user = {
    email: '',
    password: '',
  };

  message = '';

  constructor(private http: HttpClient) {}

  loginUser() {
    this.http.post<any>('http://localhost:3000/login', this.user).subscribe({
      next: (res) => {
        this.message = res.message;

        // Store token in localStorage
        localStorage.setItem('token', res.token);

        // Redirect or update UI as needed
        console.log('Token stored:', res.token);
      },
      error: (err) => {
        console.error(err);
        this.message = err.error?.error || 'Login failed!';
      },
    });
  }
}
