# TODO - Resend OTP cooldown

## Plan (implementation steps)
- [ ] Update `src/app/login/page.tsx` to add a `Resend OTP` UI on the OTP step.
- [ ] Implement 30-second cooldown state (disabled + countdown).
- [ ] Add handler to call the existing send OTP flow/API using the same phone & countryCode.
- [ ] Ensure cooldown resets when user changes number (back to phone step).
- [ ] Keep loading/error behavior consistent with existing send/verify handlers.

## Progress
- [ ] Not started

