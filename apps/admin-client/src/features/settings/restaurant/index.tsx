import ContentSection from '../components/content-section';
import { RestaurantSettingsForm } from './restaurant-form';

export default function SettingsRestaurant() {
  return (
    <ContentSection
      title="Restaurant"
      desc="Manage your restaurant details and settings."
    >
      <RestaurantSettingsForm />
    </ContentSection>
  );
}
