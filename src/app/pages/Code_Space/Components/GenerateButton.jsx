import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';


export default function GenerateButton() {
    const [link, setLink] = useState(null);
    const { Database } = useSelector(state => state.prompt);

    useEffect(() => {
        setLink(uuidv4());
    }, []);

    const handleGenerateClick = () => {
        if (Database.length <= 4) {
            toast.warning('Please complete you Database Schemas.', {
                style: { background: '#202020', color: '#fff', border: '1px solid #1818' },
            });
        } else {
            toast('Redirecting...', {
                style: { background: '#181818', color: '#fff', border: '1px solid #333333' }
            }, {
                duration: 5000,
            });
        }
    };

    return Database.length > 4 ? (
        <NavLink to={`/playground/${link}`}>
            <Button >Generate</Button>
        </NavLink>
    ) : (
        <div>
            {/* <Toaster /> */}
            <Button variant="outline" onClick={handleGenerateClick}>
                Generate
            </Button>
        </div>
    );
}
