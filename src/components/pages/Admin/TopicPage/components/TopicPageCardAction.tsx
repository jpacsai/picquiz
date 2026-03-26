import { Button } from '@mui/material';

import { RouterLink } from '@/components/ui/RouterLink';

type TopicPageCardActionProps = {
  label: string;
  params: {
    topicId: string;
  };
  search?: {
    saved?: undefined;
  };
  to: '/admin/$topicId/items' | '/admin/$topicId/schema';
  variant: 'contained' | 'outlined';
};

const TopicPageCardAction = ({
  label,
  params,
  search,
  to,
  variant,
}: TopicPageCardActionProps) => {
  return (
    <RouterLink params={params} search={search} to={to} underline="none" preload="intent">
      <Button component="span" fullWidth variant={variant}>
        {label}
      </Button>
    </RouterLink>
  );
};

export default TopicPageCardAction;
