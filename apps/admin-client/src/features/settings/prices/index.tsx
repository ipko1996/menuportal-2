import ContentSection from '../components/content-section';
import PricesForm from './prices-form';

export default function SettingsPrices() {
  return (
    <ContentSection
      title="Prices"
      desc="This is how others will see you on the site."
    >
      <PricesForm />
    </ContentSection>
  );
}
