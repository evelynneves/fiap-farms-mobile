/******************************************************************************
 *                                                                             *
 * Creation Date : 16/04/2025                                                  *
 *                                                                             *
 * Property : (c) This program, code or item is the Intellectual Property of   *
 * Evelyn Neves Barreto. Any use or copy of this code is prohibited without    *
 * the express written authorization of Evelyn. All rights reserved.           *
 *                                                                             *
 *******************************************************************************/

import { AuthProvider } from "@/src/modules/shared/contexts/useAuthContext";
import { Slot } from "expo-router";

export default function RootLayout() {
    return (
        <AuthProvider>
            <Slot />
        </AuthProvider>
    );
}
