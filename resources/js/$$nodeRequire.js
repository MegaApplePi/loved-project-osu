/* globals nodeRequire */
export const fs = nodeRequire("fs");
export const path = nodeRequire("path");
export const electron = nodeRequire("electron");
export const {shell} = electron;
export const {remote} = electron;
export const {app} = remote;
export const {dialog} = remote;
