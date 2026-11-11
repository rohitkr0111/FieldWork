import {ResetPassword} from '../components';
export default async function Page({searchParams}){const {token=''}=await searchParams;return <ResetPassword token={token}/>;}
