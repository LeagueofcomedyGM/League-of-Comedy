import React from 'react';
import { Mic2 } from 'lucide-react';
import { AdminLayout } from '../AdminLayout';
import { CsvImport } from '../components/CsvImport';
import {
  COMEDIAN_REQUIRED_FIELDS,
  COMEDIAN_PREVIEW_COLS,
  getComedianDocId,
  buildComedianDoc,
} from '../lib/comediansImport';

interface Props { currentPath: string; }

export const ComeidiansPage: React.FC<Props> = ({ currentPath }) => (
  <AdminLayout currentPath={currentPath}>
    <CsvImport
      collectionName="comedians"
      pageTitle="Comedians"
      icon={<Mic2 className="w-5 h-5 text-amber-400" />}
      requiredFields={COMEDIAN_REQUIRED_FIELDS}
      getDocId={getComedianDocId}
      buildDoc={buildComedianDoc}
      previewCols={COMEDIAN_PREVIEW_COLS}
    />
  </AdminLayout>
);
