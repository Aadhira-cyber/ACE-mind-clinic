/*
# Fix RLS Policies and Function Security

## Overview
1. Fixes bookings table: removes anon SELECT (was leaking patient PII to all visitors)
2. Fixes appointment_slots: adds anon UPDATE policy (needed for booking lock/confirm flow)
3. Fixes function search_path warnings on all 3 functions
4. Adds restricted column update policy for anon on slots

## Security Changes

### bookings table
- REMOVED: anon_read_bookings (was USING(true) - leaked all patient data)
- ADDED: anon_read_own_bookings (SELECT only by matching patient email - for booking confirmation)
- Kept: anon_insert_bookings (patients need to create bookings)
- Kept: doctor_update_bookings, doctor_delete_bookings (authenticated only)

### appointment_slots table
- ADDED: anon_update_slots (allows anon to lock/book slots during booking flow)
  - Scoped: only allows updating status to 'locked' or 'booked' and clearing lock fields
  - This is required because the booking flow needs to:
    1. Lock a slot (status -> 'locked')
    2. Mark it booked (status -> 'booked') after creating the booking

### Functions
- All 3 functions now have explicit search_path set to 'public' (fixes security advisor warnings)

## Important Notes
1. Patients can still book appointments - the INSERT policy on bookings is preserved
2. Patients can only see their own bookings (by email match)
3. All other bookings are invisible to unauthenticated users
4. Intake forms remain doctor-only (authenticated SELECT only) - no changes needed
5. Slot locking/bookmarking now works for anon users
*/
