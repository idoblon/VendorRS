# TODO for AdminDashboard Analytics Fallback Improvement

- [x] Update AdminDashboard.tsx to improve fallback logic in fetchCentersAnalytics:
  - Use actual database centers if API returns success: false instead of mock data immediately.
- [x] Test the AdminDashboard to verify analytics data displays correctly with fallback.
- [ ] Verify no regressions in vendor and center data display.
- [ ] Confirm notifications and message box functionality remain intact.
- [ ] Get user feedback on the update.
