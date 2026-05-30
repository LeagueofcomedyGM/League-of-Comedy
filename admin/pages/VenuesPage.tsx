import React from 'react';
import { Building2 } from 'lucide-react';
import { AdminLayout } from '../AdminLayout';
import { CsvImport } from '../components/CsvImport';
import {
  VENUE_REQUIRED_FIELDS,
  VENUE_PREVIEW_COLS,
  getVenueDocId,
  buildVenueDoc,
} from '../lib/venuesImport';

interface Props { currentPath: string; }

export const VenuesPage: React.FC<Props> = ({ currentPath }) => (
  <AdminLayout currentPath={currentPath}>
    <CsvImport
      collectionName="venues"
      pageTitle="Venues"
      icon={<Building2 className="w-5 h-5 text-emerald-400" />}
      requiredFields={VENUE_REQUIRED_FIELDS}
      getDocId={getVenueDocId}
      buildDoc={buildVenueDoc}
      previewCols={VENUE_PREVIEW_COLS}
    />
  </AdminLayout>
);
