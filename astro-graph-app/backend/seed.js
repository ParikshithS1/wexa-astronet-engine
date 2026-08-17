const neo4j = require('neo4j-driver');
require('dotenv').config();

const uri = process.env.COGNODB_URI;
const password = process.env.COGNODB_PASSWORD;
const user = 'cognodb';

if (!uri || !password) {
  console.error("❌ Missing environments variables. Seed aborted.");
  process.exit(1);
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

async function runSeed() {
  const session = driver.session();
  console.log("🪐 Beginning lightweight graph seeding for free tier restrictions...");
  
  try {
    // Clear old data constraints or labels gracefully
    await session.run("MATCH (n) DETACH DELETE n");
    
    // Seed core framework entities
    await session.run(`
      CREATE (scorp:ZodiacSign {name: 'Scorpio', element: 'Water'})
      CREATE (leo:ZodiacSign {name: 'Leo', element: 'Fire'})
      CREATE (gem:ZodiacSign {name: 'Gemini', element: 'Air'})
      
      CREATE (sun:CelestialBody {name: 'Sun', type: 'Star'})
      CREATE (moon:CelestialBody {name: 'Moon', type: 'Satellite'})
      CREATE (mars:CelestialBody {name: 'Mars', type: 'Planet'})
      
      CREATE (mars)-[:RULES]->(scorp)
      CREATE (sun)-[:RULES]->(leo)
    `);
    
    // Seed sample target users
    await session.run(`
      CREATE (u1:User {id: 'user_01', name: 'Aria Vance'})
      CREATE (u2:User {id: 'user_02', name: 'Leo Sterling'})
      CREATE (u3:User {id: 'user_03', name: 'Nova Rayne'})
      
      // Placements
      MATCH (u1:User {id: 'user_01'}), (sun:CelestialBody {name: 'Sun'}), (scorp:ZodiacSign {name: 'Scorpio'})
      CREATE (u1)-[:HAS_PLACEMENT]->(sun)
      CREATE (sun)-[:PLACED_IN]->(scorp)
      
      // Create multi-hop test loops
      MATCH (u2:User {id: 'user_02'}), (mars:CelestialBody {name: 'Mars'})
      CREATE (u2)-[:HAS_PLACEMENT]->(mars)
      
      // Inter-planetary aspect paths
      MATCH (p1:CelestialBody {name: 'Sun'}), (p2:CelestialBody {name: 'Mars'})
      CREATE (p1)-[:ASPECTS {type: 'Trine'}]->(p2)
      CREATE (p2)-[:ASPECTS {type: 'Trine'}]->(p1)
    `);
    
    console.log("✅ Seeding script complete. All foundational elements mapped cleanly!");
  } catch (err) {
    console.error("❌ Seed transaction collapsed:", err.message);
  } finally {
    await session.close();
    await driver.close();
  }
}

runSeed();
