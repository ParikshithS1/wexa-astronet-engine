const express = require('express');
const neo4j = require('neo4j-driver');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5001;
const uri = process.env.COGNODB_URI;
const password = process.env.COGNODB_PASSWORD;
const user = 'cognodb';

let driver;
try {
  if (!uri || !password) {
    console.warn("⚠️ Warning: Missing configuration variables. Please update backend/.env with live credentials.");
  }
  driver = neo4j.driver(uri || 'bolt://localhost:7687', neo4j.auth.basic(user, password || 'password'));
  console.log("⚡ CognoDB Driver interface attached.");
} catch (err) {
  console.error("❌ Driver configuration fault:", err.message);
  driver = null;
}

const checkDbConnection = async (req, res, next) => {
  if (!driver) {
    return res.status(503).json({ 
      error: "Database Unreachable", 
      message: "The cosmic database driver is uninitialized. Configure variables in backend/.env" 
    });
  }
  try {
    const session = driver.session();
    await session.run("RETURN 1");
    session.close();
    next();
  } catch (error) {
    return res.status(503).json({ 
      error: "Database Connection Interrupted", 
      message: "Cannot bridge active network link to CognoDB cloud instance. Check credentials or database status." 
    });
  }
};

app.get('/api/synastry/:userId', checkDbConnection, async (req, res) => {
  const { userId } = req.params;
  const session = driver.session();
  const cypherQuery = `
    MATCH (u1:User {id: $currentUserId})-[:HAS_PLACEMENT]->(p1:CelestialBody)-[:PLACED_IN]->(sign:ZodiacSign)
    MATCH (ruler:CelestialBody)-[:RULES]->(sign)
    MATCH (ruler)<-[:HAS_PLACEMENT]-(u2:User)
    MATCH (u1)-[:HAS_PLACEMENT]->(p2:CelestialBody)-[a:ASPECTS]->(p3:CelestialBody)<-[:HAS_PLACEMENT]-(u2)
    WHERE u1.id <> u2.id AND a.type IN ['Trine', 'Sextile']
    RETURN u2.name AS CompatibleMatch, 
           p2.name AS MyPlanet, 
           a.type AS AspectType, 
           p3.name AS TheirPlanet, 
           sign.name AS SharedSign
    LIMIT 5
  `;
  try {
    const result = await session.run(cypherQuery, { currentUserId: userId });
    const records = result.records.map(record => ({
      matchName: record.get('CompatibleMatch'),
      myPlanet: record.get('MyPlanet'),
      aspect: record.get('AspectType'),
      theirPlanet: record.get('TheirPlanet'),
      sign: record.get('SharedSign')
    }));
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ error: "Query execution failed", details: error.message });
  } finally {
    await session.close();
  }
});

app.get('/api/patterns/:userId', checkDbConnection, async (req, res) => {
  const { userId } = req.params;
  const session = driver.session();
  const cypherQuery = `
    MATCH (u:User {id: $userId})-[:HAS_PLACEMENT]->(p1:CelestialBody),
          (u)-[:HAS_PLACEMENT]->(p2:CelestialBody),
          (u)-[:HAS_PLACEMENT]->(p3:CelestialBody)
    MATCH (p1)-[a1:ASPECTS {type: 'Trine'}]->(p2),
          (p2)-[a2:ASPECTS {type: 'Trine'}]->(p3),
          (p3)-[a3:ASPECTS {type: 'Trine'}]->(p1)
    WHERE p1.name < p2.name AND p2.name < p3.name
    RETURN p1.name + ' - ' + p2.name + ' - ' + p3.name AS GrandTrine
  `;
  try {
    const result = await session.run(cypherQuery, { userId });
    const patterns = result.records.map(record => record.get('GrandTrine'));
    res.json({ success: true, patterns });
  } catch (error) {
    res.status(500).json({ error: "Failed to evaluate geometric patterns", details: error.message });
  } finally {
    await session.close();
  }
});

app.listen(port, () => console.log(`🚀 AstroNet Service streaming live on port ${port}`));
