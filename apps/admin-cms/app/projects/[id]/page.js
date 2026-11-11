import {ProjectEditor,ProjectGallery,Shell} from '../../components';
export default function EditProject({params}){return <Shell title="Edit website project"><p className="mb-5 text-sm text-ink/60">Update project details and publishing status.</p><ProjectEditor projectId={params.id}/><ProjectGallery projectId={params.id}/></Shell>;}
