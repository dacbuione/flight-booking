import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-flight-search',
  templateUrl: './flight-search.component.html',
  styleUrls: ['./flight-search.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink]
})
export class FlightSearchComponent implements OnInit {
  searchForm!: FormGroup;
  isRoundTrip = true;
  popularDestinations = [
    {
      name: 'Hà Nội',
      code: 'HAN',
      description: 'Thủ đô nghìn năm văn hiến với nhiều di tích lịch sử',
      image: 'https://etrip4utravel.s3-ap-southeast-1.amazonaws.com/images/article/2022/11/a1040374-9b63-4c63-850e-1fcb8d0b0a97.png'
    },
    {
      name: 'Đà Nẵng',
      code: 'DAD',
      description: 'Thành phố biển xinh đẹp với cầu Rồng nổi tiếng',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSkqIWmQuEXpsVCgOFA5uNVL7HIa3i5WyKcg&s'
    },
    {
      name: 'Phú Quốc',
      code: 'PQC',
      description: 'Hòn đảo thiên đường với bãi biển trong xanh',
      image: 'https://nld.mediacdn.vn/291774122806476800/2025/3/14/cap-treo-hon-thom-la-bieu-tuong-do-thi-phia-nam-dao-phu-quoc-1741951926289278247467.jpg'
    },
    {
      name: 'Tokyo',
      code: 'TYO',
      description: 'Thủ đô hiện đại của Nhật Bản',
      image: 'https://a.storyblok.com/f/55469/1170x728/686a5d2781/jp_00_tyo_1.jpeg/m/645x0/filters:format(webp)'
    }
  ];
  
  constructor(private fb: FormBuilder, private router: Router) {}
  
  ngOnInit(): void {
    this.initForm();
  }
  
  initForm(): void {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.searchForm = this.fb.group({
      tripType: ['roundTrip', Validators.required],
      origin: ['', Validators.required],
      destination: ['', Validators.required],
      departDate: [today.toISOString().split('T')[0], [Validators.required, this.dateNotInPastValidator()]],
      returnDate: [tomorrow.toISOString().split('T')[0]],
      passengers: this.fb.group({
        adults: [1, [Validators.required, Validators.min(1), Validators.max(9)]],
        children: [0, [Validators.min(0), Validators.max(9)]],
        infants: [0, [Validators.min(0), Validators.max(9)]]
      }),
      cabinClass: ['economy', Validators.required]
    });
    
    // Theo dõi thay đổi loại chuyến bay
    this.searchForm.get('tripType')?.valueChanges.subscribe(value => {
      this.isRoundTrip = value === 'roundTrip';
      
      if (this.isRoundTrip) {
        this.searchForm.get('returnDate')?.setValidators([Validators.required, this.returnDateValidator()]);
      } else {
        this.searchForm.get('returnDate')?.clearValidators();
        this.searchForm.get('returnDate')?.updateValueAndValidity();
      }
    });
    
    // Add listener for departDate changes
    this.searchForm.get('departDate')?.valueChanges.subscribe(value => {
      // If return date exists and is now earlier than departure date, update it
      if (this.isRoundTrip) {
        const returnDate = this.searchForm.get('returnDate')?.value;
        if (returnDate && value && new Date(value) > new Date(returnDate)) {
          this.searchForm.get('returnDate')?.setValue(value);
        }
        // Revalidate return date when departure date changes
        this.searchForm.get('returnDate')?.updateValueAndValidity();
      }
    });
  }
  
  // Custom validator to ensure departure date is not in the past
  dateNotInPastValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const inputDate = new Date(control.value);
      inputDate.setHours(0, 0, 0, 0);
      
      return inputDate < today ? { pastDate: true } : null;
    };
  }
  
  // Custom validator to ensure return date is not earlier than departure date
  returnDateValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      
      const departDate = this.searchForm?.get('departDate')?.value;
      if (!departDate) {
        return null;
      }
      
      const inputDate = new Date(control.value);
      const departureDate = new Date(departDate);
      
      return inputDate < departureDate ? { invalidReturnDate: true } : null;
    };
  }
  
  // Return today's date as a string in YYYY-MM-DD format for the min attribute of date inputs
  getTodayString(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  
  onSearch(): void {
    if (this.searchForm.valid) {
      const formValues = this.searchForm.value;
      
      // Navigate to flight listing page with search parameters
      this.router.navigate(['/flight-listing'], {
        queryParams: {
          origin: formValues.origin,
          destination: formValues.destination,
          departDate: formValues.departDate,
          returnDate: this.isRoundTrip ? formValues.returnDate : null,
          adults: formValues.passengers.adults,
          children: formValues.passengers.children,
          infants: formValues.passengers.infants,
          cabinClass: formValues.cabinClass,
          tripType: formValues.tripType
        }
      });
    }
  }
  
  swapLocations(): void {
    const origin = this.searchForm.get('origin')?.value;
    const destination = this.searchForm.get('destination')?.value;
    
    this.searchForm.patchValue({
      origin: destination,
      destination: origin
    });
  }
} 