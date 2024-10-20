import 'dotenv/config'
import supabase from "./database/config";


import cors from "cors";
import http from "http";
import express from "express";
import morgan from "morgan";

const testConnection = async () => {
  const { data, error } = await supabase
  .from('notes')
  .select('*')
  .order('id', { ascending: false })
  .limit(10);
  if(error) {
    console.log('Error trayendo datos',error);
  } else {
    console.log('Datos trayendo',data);
  }
}
testConnection();
