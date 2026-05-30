import React from 'react';
import { Trophy } from 'lucide-react';
import { AdminLayout } from '../AdminLayout';
import { CsvImport } from '../components/CsvImport';
import {
  FESTIVAL_REQUIRED_FIELDS,
  FESTIVAL_PREVIEW_COLS,
  getFestivalDocId,
  parseFestivalExtra,
  buildFestivalDoc,
} from '../lib/festivalsImport';

interface Props { currentPath: string; }

export const FestivalsPage: React.FC<Props> = ({ currentPath }) => (
  <AdminLayout currentPath={currentPath}>
    <CsvImport
      collectionName="festivals"
      pageTitle="Festivals"
      icon={<Trophy className="w-5 h-5 text-purple-400" />}
      requiredFields={FESTIVAL_REQUIRED_FIELDS}
      getDocId={getFestivalDocId}
      parseExtra={parseFestivalExtra}
      buildDoc={buildFestivalDoc}
      previewCols={FESTIVAL_PREVIEW_COLS}
    />
  </AdminLayout>
);
