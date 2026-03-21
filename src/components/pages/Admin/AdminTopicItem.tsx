import { Button, Card, CardActions, CardContent, Typography } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';

import type { TopicItem } from '@/service/items';
import type { TopicField } from '@/types/topics';

type AdminTopicItemProps = {
  fields: ReadonlyArray<TopicField>;
  item: TopicItem;
  topicId: string;
};

const getDisplayValue = (value: unknown) => {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();

    return trimmedValue.length ? trimmedValue : null;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return null;
};

const getValuesByDisplay = (
  fields: ReadonlyArray<TopicField>,
  item: TopicItem,
  display: NonNullable<TopicField['display']>,
) => {
  return fields
    .filter((field) => field.display === display)
    .map((field) => getDisplayValue(item[field.key]))
    .filter((value): value is string => value !== null);
};

const getFallbackTitle = (item: TopicItem) => {
  const fallbackValue = [item.title, item.artist]
    .map(getDisplayValue)
    .find((value): value is string => value !== null);

  return fallbackValue ?? item.id;
};

const getFallbackSubtitle = (item: TopicItem) => {
  return [item.artist, item.year]
    .map(getDisplayValue)
    .filter((value): value is string => value !== null)
    .join(' - ');
};

const AdminTopicItem = ({ fields, item, topicId }: AdminTopicItemProps) => {
  const navigate = useNavigate();
  const titleValues = getValuesByDisplay(fields, item, 'title');
  const subtitleValues = getValuesByDisplay(fields, item, 'subtitle');
  const metaValues = getValuesByDisplay(fields, item, 'meta');

  const title = titleValues[0] ?? getFallbackTitle(item);
  const subtitle = subtitleValues.length ? subtitleValues.join(' - ') : getFallbackSubtitle(item);
  const meta = metaValues.join(' - ');

  return (
    <Card key={item.id} sx={{ width: '100%' }}>
      <CardContent sx={{ display: 'grid', gap: 0.5 }}>
        <Typography variant="h6">{title}</Typography>
        {subtitle ? (
          <Typography color="text.secondary" variant="body2">
            {subtitle}
          </Typography>
        ) : null}
        {meta ? (
          <Typography color="text.secondary" variant="caption">
            {meta}
          </Typography>
        ) : null}
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Button
          variant="outlined"
          onClick={() => {
            void navigate({
              to: '/admin/$topicId/$itemId/edit',
              params: { itemId: item.id, topicId },
            });
          }}
        >
          Szerkesztés
        </Button>
      </CardActions>
    </Card>
  );
};

export default AdminTopicItem;
