import ContentSection from '../components/content-section';
import { IntegrationsForm } from './integrations-form';

export default function SettingsIntegrations() {
  return (
    <ContentSection
      title="Integrations"
      desc="Manage your third-party integrations and connected apps."
    >
      <IntegrationsForm />
    </ContentSection>
  );
}
