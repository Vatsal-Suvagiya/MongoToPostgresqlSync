const dbConfig = require("./dbconnection").dbConfig;
const { query } = require("express");
const pool = require("./postgre_connection");
const moment = require("moment");
const { flatten } = require("flat");
const { max } = require("moment");
const { raw } = require("body-parser");

const db = new dbConfig();
// create_foreign_candidate_score_details  -- for postgre to two level nested

//create_question_foreign           -- only for question'
//insert_question_foreign

// insert_foreign
// create_foreign
// foreignTable           -- for potgre to one level nested

// createTable          -- for mogo to postgre
// insert_queryGenerator
// create_queryGenerator

// time_convert

function createTable(collection) {
  create_queryGenerator(collection).then((query) => {
    console.log("fun query::", query);
    pool
      .query(query)
      .then((res) => {
        insert_queryGenerator(collection);
        console.log("res", res);
      })
      .catch((err) => {
        console.log("err-------:", err);
      });
  });
}

function create_queryGenerator(collection) {
  return new Promise((resolve, reject) => {
    db.connectDb().then(async (db) => {
      // console.log("database",database);
      let q = null;
      let arr1 = [];
      var resp = await db
        .collection(collection)
        .find({})
        .forEach((result) => {
          if (result) {
            result = flatten(result, { safe: true });
            //only for one table code  table "lookup_details"
            // if(result["attribute_value"] && result["attribute_value"].indexOf('{')==0)
            // {
            //     result["attribute_value"] = JSON.parse(result["attribute_value"],null,3)
            //     result= flatten(result,{safe :true})
            // }
            // console.log(result);
            if (q == null) {
              q = `CREATE TABLE IF NOT EXISTS ${collection}(`;
            }
            Object.entries(result).forEach(([key, value], val) => {
              key = key.replace(/[^a-zA-Z ]/g, "_");
              if (key == "to") {
                key = "too_";
              } else if (key == "from") {
                key = "from_";
              } else if (key == "order") {
                key = "order_";
              }

              if (!arr1.includes(key)) {
                arr1.push(key);

                let type = "varchar(512)";
                // console.log('val::',Object.keys(result).length);
                if (key == "ctc") {
                  type = "varchar(512)";
                } else if (typeof value == "number") {
                  type = "bigint";
                } else if (value instanceof Date == true) {
                  type = "timestamp";
                } else if (Array.isArray(value)) {
                  // type = 'text[]'
                  type = "json";
                } else if (typeof value == "boolean") {
                  type = "boolean";
                } else if (Object.keys(result).length - 1 == val) {
                  return;
                } else {
                  // if(value.length >=512)
                  // {
                  //     if(value.length >=1024){

                  //     if(value.length >=2048){
                  //         type = 'varchar(max)'
                  //     }
                  //     else
                  //     type = 'varchar(2048)'
                  //     }
                  //     else
                  //     type = 'varchar(1024)'
                  // }
                  // else
                  //     type = 'varchar(512)'
                  if (value.length >= 512) type = "varchar";
                  else type = "varchar(512)";
                }
                q = q + key + " " + type + ",";
              }
            });
            // q = q+ 'department varchar(512) ,'
          }
        });
      q = q.substring(0, q.length - 1) + ")";

      console.log("query:", q);
      resolve(q);
    });
  });
}

function insert_queryGenerator(collection) {
  db.connectDb().then((db) => {
    // db.collection(collection).findOne({}).then((raw) => {
    db.collection(collection)
      .find({})
      .forEach((raw) => {
        raw = flatten(raw, { safe: true });
        //only for one table code "lookup_details"
        // if(raw["attribute_value"] && raw["attribute_value"].indexOf('{')==0)
        // {
        //     raw["attribute_value"] = JSON.parse(raw["attribute_value"],null,3)

        //     raw = flatten(raw,{safe :true})

        // }
        let query = `insert into ${collection} (`;

        let q_values = `values(`;
        Object.entries(raw).forEach(([key, value], val) => {
          // console.log("value::",raw);
          key = key.replace(/[^a-zA-Z ]/g, "_");
          if (key == "to") {
            key = "too_";
          } else if (key == "from") {
            key = "from_";
          } else if (key == "order") {
            key = "order_";
          }

          if (Object.entries(raw).length - 1 != val) {
            query += key + ",";
          }
          if (Object.entries(raw).length - 1 == val) {
            return;
          } else if (typeof value == "number") {
            q_values += value + ",";
          } else if (value instanceof Date == true) {
            q_values += `'${time_convert(value)}',`;
          } else if (Array.isArray(value) == true) {
            // console.log("value before::",value);
            value = JSON.stringify(value, null, 3).replaceAll("'", "''");
            // console.log("value after::",value);

            // query += 'Array' + JSON.stringify(value,null,3) + ',
            q_values += "('" + value + "'),";

            // value.forEach(element => {
            //     query += "'"+element +"',"
            // });
            // query=query.substring(0, query.length - 1) + '],'
          } else if (typeof value == "boolean") {
            q_values += `${value},`;
          } else {
            // console.log("value",value);
            value = value.toString();
            value = value.replaceAll("'", "''");
            q_values += `'${value}',`;
          }
        });
        query = query.substring(0, query.length - 1) + ")";
        q_values = q_values.substring(0, q_values.length - 1) + ")";
        query += " " + q_values;
        // console.log('insert query:::',query);
        pool
          .query(query)
          .then((res) => {
            console.log("inserted");
          })
          .catch((err) => {
            console.log("error query::", query);
            console.log("err:::", err);
          });
      });
  });
}

function time_convert(str) {
  var date = moment(new Date(str));
  // console.log(str);
  //   mnth = ("0" + (date.getMonth() + 1)).slice(-2),
  //   day = ("0" + date.getDate()).slice(-2);
  // return [date.getFullYear(), mnth, day].join("-");
  // date.format('DD-MM-YYYY hh:mm:ss A')
  return date.format("DD-MM-YYYY hh:mm:ss A");
}

function foreignTable(table, jsonColumn, idColumn) {
  pool
    .query(`select * from ${table}`)
    .then((result) => {
      console.log(JSON.stringify(result.rows[0], null, 3));

      // create_foreign(table,jsonColumn,result.rows,idColumn).then((create_query)=>{
      create_foreign_candidate_score_details(
        table,
        jsonColumn,
        result.rows,
        idColumn
      ).then((create_query) => {
        // create_question_foreign(table,jsonColumn,result.rows,idColumn).then((create_query)=>{

        console.log("create query:", create_query);
        pool.query(create_query).then((c_result) => {
          console.log("table created..");

          // insert_foreign(table,jsonColumn,result.rows,idColumn)
          // insert_question_foreign(table,jsonColumn,result.rows,idColumn)
          insert_foreign_candidate_score_details(
            table,
            jsonColumn,
            result.rows,
            idColumn
          );
        });
      });
      // let create_query = `create table if not exists ${table}_R_${jsonColumn}(
      //     ${jsonColumn}_id serial,
      //     ${table}_id varchar(512) ,
      //     language varchar(50),
      //     skill varchar(50),
      //     level varchar(50),
      //     constraint fk_${table}_id FOREIGN KEY (${table}_id) REFERENCES  ${table}(_id))`
      // console.log("create_query::",create_query)

      // pool.query(create_query).then((c_result)=>{
      //     var insert_query = `insert into ${table}_R_${jsonColumn} (${table}_id,language,skill,level)`
      //     result.rows.forEach((raw)=>{
      //         console.log("raw-",raw);
      //         raw.languages.forEach((r)=>{
      //         console.log("raw-languages",r);

      //             r.language_skills.forEach((sk)=>{
      //                 var value = `values('${raw._id}','${r.language}','${sk.skill}','${sk.level}')`
      //                 console.log("value:-",value);
      //                 pool.query(insert_query+value).then(()=>{
      //                     console.log("record inserted..");
      //                     console.log("value:-",value);
      //                 })
      //                 .catch((err)=>{
      //                     console.log("err:",err);
      //                 })
      //             })
      //         })
      //     })
      // })
      // .catch((err)=>{
      //     console.log("erre:",err);
      // })

      // result.rows.forEach((raw)=>{

      // })
    })
    .catch((err) => {
      console.log("err:", err);
    });
}

function create_foreign(table, jsonColumn, raws, idColumn = null) {
  return new Promise((resolve, reject) => {
    let q = null;
    let arr1 = [];

    raws.forEach((raw) => {
      // console.log("--------------------------------------------------------------------------------------------");
      // raw = JSON.stringify(JSON.parse(raw[jsonColumn],null,3),null,3)
      // console.log(raw);

      if (raw[jsonColumn] == null || raw[jsonColumn] == undefined) {
        return;
      }
      // for only group_details table  who is in string for object    something like "{we:WEw}"
      else if (raw[jsonColumn] && raw[jsonColumn].indexOf("{") == 0) {
        raw[jsonColumn] = JSON.parse(raw[jsonColumn], null, 3);
        // console.log("qq",raw[jsonColumn]);
        // var a =[]
        //     a.push(raw[jsonColumn])
        raw[jsonColumn] = raw[jsonColumn].response;
      }
      raw[jsonColumn].forEach((result) => {
        if (result) {
          result = flatten(result, { safe: true });

          // console.log(result);
          if (q == null) {
            q = `create table if not exists ${table}_R_${jsonColumn}(${jsonColumn}_id serial,${table}_Objectid varchar(512),`;
            if (idColumn != "oo") {
              q += `${table}_id int ,`;
            }
          }
          Object.entries(result).forEach(([key, value], val) => {
            key = key.replace(/[^a-zA-Z ]/g, "_");
            if (key == idColumn) {
              return;
            }

            if (key == "to") {
              key = "too_";
            } else if (key == "from") {
              key = "from_";
            } else if (key == "order") {
              key = "order_";
            }

            if (!arr1.includes(key)) {
              arr1.push(key);

              let type = "varchar(512)";
              // console.log('val::',Object.keys(result).length);
              if (key == "ctc") {
                type = "varchar(512)";
              } else if (typeof value == "number") {
                type = "bigint";
              } else if (value instanceof Date == true) {
                type = "timestamp";
              } else if (Array.isArray(value)) {
                // type = 'text[]'
                type = "json";
              } else if (typeof value == "boolean") {
                type = "boolean";
              } else {
                if (value.length >= 512) type = "varchar";
                else type = "varchar(512)";
              }
              q = q + key + " " + type + ",";
            }
          });
          // q = q+ 'department varchar(512) ,'
        }
      });
    });
    if (idColumn != "oo") {
      q =
        q +
        `constraint fk_${table}_id FOREIGN KEY (${table}_id) REFERENCES  ${table}(${idColumn}))`;
    } else {
      q =
        q +
        `constraint fk_${table}_Objectid FOREIGN KEY (${table}_Objectid) REFERENCES  ${table}(_id))`;
    } // q=q.substring(0, q.length - 1) + ')'

    console.log("query:", q);
    resolve(q);
  });
}
///baki from now
function insert_foreign(table, jsonColumn, raws, idColumn) {
  if (!Array.isArray(raws)) {
    raws = [raws];
  }
  raws.forEach((raw) => {
    if (raw[jsonColumn] == null || raw[jsonColumn] == undefined) {
      return;
    }

    // for only string of object field
    // else if (raw[jsonColumn] && raw[jsonColumn].indexOf('{')==0)
    // {
    //     raw[jsonColumn] = JSON.parse(raw[jsonColumn],null,3)
    //     // console.log("qq",raw[jsonColumn]);
    //     // var a =[]
    //     //     a.push(raw[jsonColumn])
    //         raw[jsonColumn] = raw[jsonColumn].response
    // }

    raw[jsonColumn].forEach((jsonObject) => {
      jsonObject = flatten(jsonObject, { safe: true });

      var query = `insert into ${table}_R_${jsonColumn} (${table}_Objectid,`;
      var q_values = `values('${raw["exam_details_objectid"]}',`;

      if (idColumn != "oo") {
        query += `${table}_id,`;
        if (typeof raw[idColumn] == "string") {
          raw[idColumn] = parseInt(raw[idColumn]);
        }
        q_values += raw[idColumn] + ",";
      }
      Object.entries(jsonObject).forEach(([key, value], val) => {
        // console.log("value::",raw);
        key = key.replace(/[^a-zA-Z ]/g, "_");

        if (key == "to") {
          key = "too_";
        } else if (key == "from") {
          key = "from_";
        } else if (key == "order") {
          key = "order_";
        }

        if (key == "selected_value_weightage" && value == "" && value != 0) {
          return;
        } else {
          query += key + ",";
        }

        if (typeof value == "number") {
          q_values += value + ",";
        } else if (value instanceof Date == true) {
          q_values += `'${time_convert(value)}',`;
        } else if (Array.isArray(value) == true) {
          // console.log("value before::",value);
          value = JSON.stringify(value, null, 3).replaceAll("'", "''");
          // console.log("value after::",value);

          // query += 'Array' + JSON.stringify(value,null,3) + ',
          q_values += "('" + value + "'),";

          // value.forEach(element => {
          //     query += "'"+element +"',"
          // });
          // query=query.substring(0, query.length - 1) + '],'
        } else if (typeof value == "boolean") {
          q_values += `${value},`;
        } else {
          // console.log("value",value);
          if (key == "selected_value_weightage") {
            q_values += 0 + ",";
          } else {
            value = value.toString();
            value = value.replaceAll("'", "''");
            q_values += `'${value}',`;
          }
        }
      });

      query = query.substring(0, query.length - 1) + ")";
      q_values = q_values.substring(0, q_values.length - 1) + ")";
      query += " " + q_values;
      // console.log('insert query:::',query);
      pool
        .query(query)
        .then((res) => {
          console.log("inserted:", query);
        })
        .catch((err) => {
          console.log("error query::", query);
          console.log("err:::", err);
        });
    });
  });
}

function create_foreign_candidate_score_details(
  table,
  jsonColumn,
  raws,
  idColumn = null
) {
  return new Promise((resolve, reject) => {
    let q = null;
    let arr1 = [];
    raws.forEach((raw) => {
      // console.log(typeof(raw));

      // raw.forEach((raw)=>{

      if (raw[jsonColumn] == null || raw[jsonColumn] == undefined) {
        return;
      }
      // raw[jsonColumn] = JSON.parse(raw[jsonColumn],null,3)

      raw[jsonColumn].forEach((result) => {
        if (result) {
          result = flatten(result, { safe: true });
          // console.log(result);
          if (q == null) {
            q = `create table if not exists ${table}_R_${jsonColumn}(${jsonColumn}_id serial,${table}_Objectid varchar(512),`;
            if (idColumn != "oo") {
              q += `${table}_id int ,`;
            }
          }
          Object.entries(result).forEach(([key, value], val) => {
            key = key.replace(/[^a-zA-Z ]/g, "_");

            if (key == "to") {
              key = "too_";
            } else if (key == "from") {
              key = "from_";
            } else if (key == "order") {
              key = "order_";
            }

            if (!arr1.includes(key)) {
              arr1.push(key);

              let type = "varchar(512)";
              // console.log('val::',Object.keys(result).length);
              if (key == "ctc") {
                type = "varchar(512)";
              } else if (typeof value == "number") {
                type = "bigint";
              } else if (value instanceof Date == true) {
                type = "timestamp";
              } else if (Array.isArray(value)) {
                // type = 'text[]'
                type = "json";
              } else if (typeof value == "boolean") {
                type = "boolean";
              } else {
                if (value.length >= 512) type = "varchar";
                else type = "varchar(512)";
              }
              q = q + key + " " + type + ",";
            }
          });
          // q = q+ 'department varchar(512) ,'
        }
        // })
      });
    });
    if (idColumn != "oo") {
      q =
        q +
        `constraint fk_${table}_id FOREIGN KEY (${table}_id) REFERENCES  ${table}(${idColumn}))`;
    } else {
      q =
        q +
        `constraint fk_${table}_Objectid FOREIGN KEY (${table}_Objectid) REFERENCES  ${table}(_id))`;
    } // q=q.substring(0, q.length - 1) + ')'

    console.log("query:", q);
    resolve(q);
  });
}
function insert_foreign_candidate_score_details(
  table,
  jsonColumn,
  raws,
  idColumn
) {
  raws.forEach((raw) => {
    if (raw[jsonColumn] == null || raw[jsonColumn] == undefined) {
      return;
    }

    // for only string of object field
    // else if (raw[jsonColumn] && raw[jsonColumn].indexOf('{')==0)
    // {
    //     raw[jsonColumn] = JSON.parse(raw[jsonColumn],null,3)
    //      console.log("qq",raw[jsonColumn]);
    //      var a =[]
    //          a.push(raw[jsonColumn])
    //         raw[jsonColumn] = raw[jsonColumn].response
    // }
    if (raw[jsonColumn][0].hasOwnProperty("value")) {
    } else {
      var arr = [];
      raw[jsonColumn].forEach((ele) => {
        arr.push({ value: ele });
      });
      raw[jsonColumn] = arr;
    }

    raw[jsonColumn].forEach((jsonObject) => {
      jsonObject = flatten(jsonObject, { safe: true });

      var query = `insert into ${table}_R_${jsonColumn} (${table}_Objectid,`;
      var q_values = `values('${raw["hirest_survey_details_objectid"]}',`;

      if (idColumn != "oo") {
        query += `${table}_id,`;
        if (typeof raw[idColumn] == "string") {
          raw[idColumn] = parseInt(raw[idColumn]);
        }
        q_values += raw[idColumn] + ",";
      }
      Object.entries(jsonObject).forEach(([key, value], val) => {
        // console.log("value::",raw);
        key = key.replace(/[^a-zA-Z ]/g, "_");

        if (key == "to") {
          key = "too_";
        } else if (key == "from") {
          key = "from_";
        } else if (key == "order") {
          key = "order_";
        }

        if (key == "selected_value_weightage" && value == "" && value != 0) {
          return;
        } else {
          query += key + ",";
        }

        if (typeof value == "number") {
          q_values += value + ",";
        } else if (value instanceof Date == true) {
          q_values += `'${time_convert(value)}',`;
        } else if (Array.isArray(value) == true) {
          // console.log("value before::",value);
          value = JSON.stringify(value, null, 3).replaceAll("'", "''");
          // console.log("value after::",value);

          // query += 'Array' + JSON.stringify(value,null,3) + ',
          q_values += "('" + value + "'),";

          // value.forEach(element => {
          //     query += "'"+element +"',"
          // });
          // query=query.substring(0, query.length - 1) + '],'
        } else if (typeof value == "boolean") {
          q_values += `${value},`;
        } else {
          // console.log("value",value);
          if (key == "selected_value_weightage") {
            q_values += 0 + ",";
          } else {
            value = value.toString();
            value = value.replaceAll("'", "''");
            q_values += `'${value}',`;
          }
        }
      });

      query = query.substring(0, query.length - 1) + ")";
      q_values = q_values.substring(0, q_values.length - 1) + ")";
      query += " " + q_values;
      console.log("insert query:::", query);
      pool
        .query(query)
        .then((res) => {
          console.log("inserted:", query);
        })
        .catch((err) => {
          console.log("error query::", query);
          console.log("err:::", err);
        });
    });
  });
}

function create_question_foreign(table, jsonColumn, raws, idColumn = null) {
  return new Promise((resolve, reject) => {
    let q = null;
    let arr1 = [];

    raws.forEach((raw) => {
      // console.log("--------------------------------------------------------------------------------------------");
      // raw = JSON.stringify(JSON.parse(raw[jsonColumn],null,3),null,3)
      // console.log(raw);

      if (raw[jsonColumn] == null || raw[jsonColumn] == undefined) {
        return;
      }
      // for only group_details table  who is in string for object    something like "{we:WEw}"
      else if (raw[jsonColumn] && raw[jsonColumn].indexOf("{") == 0) {
        raw[jsonColumn] = JSON.parse(raw[jsonColumn], null, 3);

        let question_title = raw[jsonColumn].question[0].name;

        raw[jsonColumn].question[0].elements.forEach((ele) => {
          ele["question_title"] = question_title;
        });
        // console.log("qq",raw[jsonColumn]);
        // var a =[]
        //     a.push(raw[jsonColumn])
        raw[jsonColumn] = raw[jsonColumn].question[0].elements;
        console.log(raw[jsonColumn]);
      }
      raw[jsonColumn].forEach((result) => {
        if (result) {
          result = flatten(result, { safe: true });

          // console.log(result);
          if (q == null) {
            q = `create table if not exists ${table}_R_${jsonColumn}(${jsonColumn}_id serial,${table}_Objectid varchar(512),`;
            if (idColumn != "oo") {
              q += `${table}_id int ,`;
            }
          }
          Object.entries(result).forEach(([key, value], val) => {
            key = key.replace(/[^a-zA-Z ]/g, "_");

            if (key == "to") {
              key = "too_";
            } else if (key == "from") {
              key = "from_";
            } else if (key == "order") {
              key = "order_";
            }

            if (!arr1.includes(key)) {
              arr1.push(key);

              let type = "varchar(512)";
              // console.log('val::',Object.keys(result).length);
              if (key == "ctc") {
                type = "varchar(512)";
              } else if (typeof value == "number") {
                type = "bigint";
              } else if (value instanceof Date == true) {
                type = "timestamp";
              } else if (Array.isArray(value)) {
                // type = 'text[]'
                type = "json";
              } else if (typeof value == "boolean") {
                type = "boolean";
              } else {
                if (value.length >= 512) type = "varchar";
                else type = "varchar(512)";
              }
              q = q + key + " " + type + ",";
            }
          });
          // q = q+ 'department varchar(512) ,'
        }
      });
    });
    if (idColumn != "oo") {
      q =
        q +
        `constraint fk_${table}_id FOREIGN KEY (${table}_id) REFERENCES  ${table}(${idColumn}))`;
    } else {
      q =
        q +
        `constraint fk_${table}_Objectid FOREIGN KEY (${table}_Objectid) REFERENCES  ${table}(_id))`;
    } // q=q.substring(0, q.length - 1) + ')'

    console.log("query:", q);
    resolve(q);
  });
}
function insert_question_foreign(table, jsonColumn, raws, idColumn) {
  if (!Array.isArray(raws)) {
    raws = [raws];
  }
  raws.forEach((raw) => {
    if (raw[jsonColumn] == null || raw[jsonColumn] == undefined) {
      return;
    }

    // for only string of object field
    else if (raw[jsonColumn] && raw[jsonColumn].indexOf("{") == 0) {
      raw[jsonColumn] = JSON.parse(raw[jsonColumn], null, 3);

      let question_title = raw[jsonColumn].question[0].name;

      raw[jsonColumn].question[0].elements.forEach((ele) => {
        ele["question_title"] = question_title;
      });
      // console.log("qq",raw[jsonColumn]);
      // var a =[]
      //     a.push(raw[jsonColumn])
      raw[jsonColumn] = raw[jsonColumn].question[0].elements;
      console.log(raw[jsonColumn]);
    }

    raw[jsonColumn].forEach((jsonObject) => {
      jsonObject = flatten(jsonObject, { safe: true });

      var query = `insert into ${table}_R_${jsonColumn} (${table}_Objectid,`;
      var q_values = `values('${raw["exam_details_objectid"]}',`;

      if (idColumn != "oo") {
        query += `${table}_id,`;
        if (typeof raw[idColumn] == "string") {
          raw[idColumn] = parseInt(raw[idColumn]);
        }
        q_values += raw[idColumn] + ",";
      }
      
      Object.entries(jsonObject).forEach(([key, value], val) => {
        // console.log("value::",raw);
        key = key.replace(/[^a-zA-Z ]/g, "_");

        if (key == "to") {
          key = "too_";
        } else if (key == "from") {
          key = "from_";
        } else if (key == "order") {
          key = "order_";
        }

        if (key == "selected_value_weightage" && value == "" && value != 0) {
          return;
        } else {
          query += key + ",";
        }

        if (typeof value == "number") {
          q_values += value + ",";
        } else if (value instanceof Date == true) {
          q_values += `'${time_convert(value)}',`;
        } else if (Array.isArray(value) == true) {
          // console.log("value before::",value);
          value = JSON.stringify(value, null, 3).replaceAll("'", "''");
          // console.log("value after::",value);

          // query += 'Array' + JSON.stringify(value,null,3) + ',
          q_values += "('" + value + "'),";

          // value.forEach(element => {
          //     query += "'"+element +"',"
          // });
          // query=query.substring(0, query.length - 1) + '],'
        } else if (typeof value == "boolean") {
          q_values += `${value},`;
        } else {
          // console.log("value",value);
          if (key == "selected_value_weightage") {
            q_values += 0 + ",";
          } else {
            value = value.toString();
            value = value.replaceAll("'", "''");
            q_values += `'${value}',`;
          }
        }
      });

      query = query.substring(0, query.length - 1) + ")";
      q_values = q_values.substring(0, q_values.length - 1) + ")";
      query += " " + q_values;
      // console.log('insert query:::',query);
      pool
        .query(query)
        .then((res) => {
          console.log("inserted:", query);
        })
        .catch((err) => {
          console.log("error query::", query);
          console.log("err:::", err);
        });
    });
  });
}

module.exports = { createTable: createTable, foreignTable: foreignTable };
