import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Brisky event workspace',description:'The event-developed Brisky workspace. See the root README for the standalone runner and external-engine requirements.'};
export default function EventLayout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;}
