import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css'],
})
export class RegistrationComponent {
  user = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  };

  message = '';

  constructor(private http: HttpClient) {}

  registerUser() {
    // Check if passwords match
    if (this.user.password !== this.user.confirmPassword) {
      this.message = 'Passwords do not match!';
      return;
    }

    // Prepare data to send (excluding confirmPassword)
    const userData = {
      name: this.user.name,
      email: this.user.email,
      phone: this.user.phone,
      password: this.user.password,
    };

    this.http.post<any>('http://localhost:3000/register', userData).subscribe({
      next: (res) => {
        this.message = res.message;
        // Reset form after successful registration
        this.user = {
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        };
      },
      error: (err) => {
        console.error(err);
        this.message = 'Registration failed!';
      },
    });
  }
}
