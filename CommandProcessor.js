process.stdin.resume();
process.stdin.setEncoding("ascii");
var input = "";

class CommandProcessor {
  currentDirectory = "";
  filesystem = {
    "C:": {},
  };

  constructor() {
    this.currentDirectory = "C:";
  }

  quit() {
    process.exit();
  }

  pwd() {
    process.stdout.write(`\nPath\n----\n${this.currentDirectory}\n\n`);
  }

  ls(options, directory = this.currentDirectory) {
    let path = Object.assign({}, this.filesystem);
    let isRecursive = false;
    for (const folder of directory.split("/")) path = path[folder];

    for (const option of options) {
      if (option == "-r") isRecursive = true;
      else {
        process.stdout.write("\n Invalid argument.\n\n");
        return;
      }
    }

    process.stdout.write(`\nPath\n----\n${directory}\n\n`);
    process.stdout.write(`Type        Files\n----        -----\n`);

    const directories = [];

    for (const item in path) {
      const type = !path[item] ? "file  " : "folder";
      process.stdout.write(`${type}      ${item}\n`);
      if (type === "folder" && isRecursive)
        directories.push(`${directory}/${item}`);
    }

    if (isRecursive) {
      for (const folder of directories) this.ls(options, folder);
    }
    process.stdout.write(`\n`);
  }

  cd(directory) {
    const isValid = this.validatePath(directory);
    if (!isValid) return;

    let path;
    if (directory.startsWith("/")) path = `C:${directory}`;
    else path = `${this.currentDirectory}/${directory}`;

    const sections = path.split("/");
    for (const item in sections) {
      const current = sections[item];
      if (current === "..") sections.splice(item - 1, 2);
    }

    this.currentDirectory = sections.join("/");
    process.stdout.write("\n\n");
  }

  create(directory, isFolder = true) {
    let fullpath;
    if (directory.startsWith("/")) fullpath = `C:${directory}`;
    else fullpath = `${this.currentDirectory}/${directory}`;

    const folders = fullpath.split("/");
    const name = folders.pop();
    let path = this.filesystem;

    for (const item of folders) {
      path = path[item];
    }
    path[name] = isFolder ? {} : false;
  }

  validatePath(name) {
    let directory;
    if (name.startsWith("/")) directory = ["C:", name.slice(1)];
    else directory = [...this.currentDirectory.split("/"), name];
    let path = this.filesystem;
    for (const item of directory) {
      if (item === "" || item === "..") continue;
      const type = !path[item] ? "file" : "folder";
      if (type === "file") {
        process.stdout.write("\nInvalid path.\n\n");
        return false;
      }
      path = path[item];
    }
    return true;
  }
}

const cmd = new CommandProcessor();

process.stdin.on("data", function (chunk) {
  input += chunk;

  console.log(input);
  const args = chunk.trim().split(" ").slice(1);

  switch (chunk.trim().split(" ")[0]) {
    case "quit":
      cmd.quit();
      break;
    case "pwd":
      cmd.pwd();
      break;
    case "ls":
      cmd.ls(args);
      break;
    case "mkdir":
      cmd.mkdir(args[0]);
      break;
    case "cd":
      cmd.cd(args[0]);
      break;
    case "touch":
      cmd.touch(args[0], false);
      break;
    default:
      console.log("Invalid command.");
  }
});
