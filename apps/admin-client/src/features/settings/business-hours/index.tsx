import ContentSection from '../components/content-section';
import { BusinessHoursForm } from './business-hours-form';

export default function SettingsBusinessHours() {
  return (
    <ContentSection
      title="Business Hours"
      desc="Set your restaurant's operating hours."
    >
      <BusinessHoursForm />
    </ContentSection>
  );
}
