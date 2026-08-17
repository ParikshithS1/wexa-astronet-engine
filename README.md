# AstroNet: Cosmic Aspect Graph Engine 

This repository holds the code for an application backed by CognoDB graph layer to evaluate complex astronomical relationships. 

## Why a Graph Database? 
Traditional relational storage limits multi-hop network discovery by forcing deep multi-join lookups on mapping tables. AstroNet utilizes CognoDB index-free adjacency loops to calculate geometric angular aspects across dynamic user placements smoothly inside low computational resource quotas. 

## Execution Sequence 

### Backend Setup 
1. Move to `backend/` directory. 
2. Install dependencies: `npm install` 
3. Duplicate `.env.example` as `.env` and assign your dedicated `COGNODB_URI` and `COGNODB_PASSWORD`. 
4. Hydrate database nodes: `npm run seed` 
5. Boot api routing listener: `npm start` 

### Frontend Setup 
1. Move to `frontend/` directory. 
2. Run installation: `npm install` 
3. Launch development build worker: `npm run dev`
