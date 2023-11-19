/********************************************************************************
* BTI325 – Assignment 02
* 
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
* 
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
* 
* Name: ______Ram Grover______ Student ID: _____158824219_____ Date: ____27/09/2023____
*
********************************************************************************/



require('dotenv').config();

const Sequelize = require('sequelize');
let sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});
sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.log('Unable to connect to the database:', err);
  });

const Set = sequelize.define('Set', {
  set_num: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  name: Sequelize.STRING,
  year: Sequelize.INTEGER,
  num_parts: Sequelize.INTEGER,
  theme_id: Sequelize.INTEGER,
  img_url: Sequelize.STRING,
},
  {
    createdAt: false,
    updatedAt: false,
  },
);


const Theme = sequelize.define('Theme', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: Sequelize.STRING,
},
  {
    createdAt: false,
    updatedAt: false,
  },
);
Set.belongsTo(Theme, { foreignKey: 'theme_id' })


function initialize() {
  return new Promise(async (resolve, reject) => {
    try {
      await sequelize.sync();
      resolve();
    } catch (err) {
      reject(err.message);
    }
  });

}
function getAllSets() {
  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [Theme],
    }).then((sets) => {
      resolve(sets);
    }).catch((err) => {
      reject(err.message);
    });
  });
}

function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    Set.findAll({
      where: { set_num: setNum },
      include: [Theme]
    }).then((set) => {
      resolve(set[0]);
    }).catch((err) => {
      reject("unable to find requested set");
    });
  });
}


function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
    Set.findAll({
      include: [Theme],
      where: {
        '$Theme.name$': { [Sequelize.Op.iLike]: `%${theme}%` }
      }
    })
      .then((sets) => {
        resolve(sets); // Return an array of sets matching the theme
      })
      .catch((err) => {
        reject("Unable to find requested sets");
      });
  });
}


function addSet(setData) {
  return new Promise((resolve, reject) => {
    Set.create({
      set_num: setData.set_num,
      name: setData.name,
      year: setData.year,
      num_parts: setData.num_parts,
      theme_id: setData.theme_id,
      img_url: setData.img_url,
    }).then(() => {
      resolve();
    })
      .catch((err) => {
        reject(err.errors[0].message);
      });
  });
}

function editSet(set_num, setData) {
  return new Promise(async (resolve, reject) => {
    try {
      const existSet = await Set.findOne({
        where: { set_num: set_num }
      });
      if (existSet) {
        await existSet.update(setData);
        resolve();
      } else {
        reject("Set not found");
      }
    } catch (error) {
      reject(error.errors[0].message);
    }
  });
}
function deleteSet(set_num) {
  return new Promise(async (resolve, reject) => {
    try {
      const existSet = await Set.findOne({
        where: { set_num: set_num }
      });
      if (existSet) {
        await existSet.destroy();
        resolve();
      }
      else{reject("Set not found")}
    }
    catch(error){
      reject (err.errors[0].message)
    }
  });
}


    function getAllThemes() {
      return new Promise(async(resolve, reject) => {
        try {
            let allThemes = await Theme.findAll();
            resolve(allThemes); 
        } catch (error) {
            reject(error);
        }
    });
    }


    module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme, addSet, editSet, deleteSet,getAllThemes };