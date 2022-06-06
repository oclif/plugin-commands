import {CliUx, Interfaces} from '@oclif/core'
import {Tree} from '@oclif/core/lib/cli-ux/styled/tree'

const addNodes = (tree: Tree, commandParts: string[]) => {
  const existingNode = tree.search(commandParts[0])

  // If the node exists and there's another part, add it to the node
  if (existingNode && commandParts[1]) {
    addNodes(existingNode as Tree, commandParts.slice(1))
  } else {
    // The node doesn't exist, create it
    tree.insert(commandParts[0])

    // If there are more parts, add them to the node
    if (commandParts.length > 1) {
      addNodes(tree.search(commandParts[0]) as Tree, commandParts.slice(1))
    }
  }
}

const createCommandTree = (commands: Interfaces.Command[], topicSeparator = ':') => {
  const tree = CliUx.ux.tree()

  commands.forEach(command => {
    const commandParts = command.id.split(topicSeparator)
    addNodes(tree, commandParts)
  })

  return tree
}

export default createCommandTree
