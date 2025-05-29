"use client";

import { useEffect } from "react";

export function BodyAttributes() {
  useEffect(() => {
    // Remove any unwanted attributes that might be added by browser extensions
    const body = document.body;
    const attributesToRemove = ['cnet-shopping-enabled'];
    
    attributesToRemove.forEach(attr => {
      if (body.hasAttribute(attr)) {
        body.removeAttribute(attr);
      }
    });
  }, []);

  return null;
} 