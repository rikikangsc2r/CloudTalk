'use client';

import { useUser } from "@/firebase";

export const useAuth = () => {
    return useUser();
};
