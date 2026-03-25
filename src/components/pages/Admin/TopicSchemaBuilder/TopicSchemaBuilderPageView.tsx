import { Alert, Box } from '@mui/material';

import CreateFieldDialog from './components/CreateFieldDialog';
import EditFieldDialog from './components/EditFieldDialog';
import FieldListSection from './components/FieldListSection';
import TopicMetadataSection from './components/TopicMetadataSection';
import TopicSchemaBuilderHeader from './components/TopicSchemaBuilderHeader';
import ValidationSummary from './components/ValidationSummary';
import { useTopicSchemaBuilderState } from './context/useTopicSchemaBuilderContext';

const TopicSchemaBuilderPageView = () => {
  const { submitError } = useTopicSchemaBuilderState();

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <TopicSchemaBuilderHeader />

      {submitError ? <Alert severity="error">{submitError}</Alert> : null}

      <TopicMetadataSection />

      <ValidationSummary />

      <FieldListSection />

      <CreateFieldDialog />

      <EditFieldDialog />
    </Box>
  );
};

export default TopicSchemaBuilderPageView;
