import WrongNetworkMessage from '../components/WrongNetworkMessage'
import ConnectWalletButton from '../components/ConnectWalletButton'
import TodoList from '../components/TodoList'
import { useState, useEffect } from 'react'
import Router from 'next/router'


// Blockchain Imports
import TaskAbi from '../../backend/build/contracts/TaskContract.json'
import { TaskContractAddress } from '../config.js'
import { ethers } from 'ethers'



/* 
const tasks = [
  { id: 0, taskText: 'clean', isDeleted: false }, 
  { id: 1, taskText: 'food', isDeleted: false }, 
  { id: 2, taskText: 'water', isDeleted: true }
]
*/

export default function Home() {

  const [correctNetwork, setCorrectNetwork] = useState(false)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [currentAccount, setCurrentAccount] = useState('')
  const [input, setInput] = useState('')
  const [tasks, setTasks] = useState([])


  useEffect(() => {
    connectWallet();
    getAllTasks();
  }, [])





  // Calls Metamask to connect wallet on clicking Connect Wallet button
  const connectWallet = async () => {
    try {
      const { ethereum } = window
      if (!ethereum) {
        console.log('Metamask not detected')
        return
      }

      let walletChainId = await ethereum.chainId;
      console.log('connected to chian:', walletChainId)

      const MumbaiChainId = '0x13881'
      if (walletChainId !== MumbaiChainId) {
        alert('you are not connected to the Mumbai testnet!')
        setCorrectNetwork(false)
        return
      } else {
        setCorrectNetwork(true)
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
      console.log('Found account', accounts[0])

      setIsUserLoggedIn(true)
      setCurrentAccount(accounts[0])

    } catch (error) {
      console.log(error)
    }
  }




  // Just gets all the tasks from the contract
  const getAllTasks = async () => {

    try {

      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const TaskContract = new ethers.Contract(TaskContractAddress, TaskAbi.abi, signer)

        let allTasks = await TaskContract.getMyTask()
        setTasks(allTasks)
      }
      else {
        console.log('ethereum object not does not exist!')
      }



    } catch (error) {
      console.log(error);
    }


  }

  // Add tasks from front-end onto the blockchain
  const addTask = async e => {
    e.preventDefault()

    let task = {
      taskText: input,
      isDeleted: false
    }

    try {

      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const TaskContract = new ethers.Contract(TaskContractAddress, TaskAbi.abi, signer)

        await TaskContract.addTask(task.taskText, task.isDeleted)
        setTasks([...tasks, task])
        console.log('added task')

      }
      else {
        console.log('ethereum object not does not exist!')
      }



    } catch (error) {
      console.log(error);
    }
    setInput('')

  }

  // Remove tasks from front-end by filtering it out on our "back-end" / blockchain smart contract
  const deleteTask = key => async () => {


    try {

      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const TaskContract = new ethers.Contract(TaskContractAddress, TaskAbi.abi, signer)

        let deleteTask = await TaskContract.deleteTask(key, true)
        console.log('successfully deleted: ', deleteTask)
        
        let allTasks = await TaskContract.getMyTask()
        setTasks(allTasks)

        Router.reload(window.location.pathname);

      }
      else {
        console.log('ethereum object not does not exist!')
      }

      

      

    } catch (error) {
      console.log(error);
    }

  }

  return (
    <div className='bg-[#97b5fe] h-screen w-screen flex justify-center py-6'>
      {!isUserLoggedIn ? <ConnectWalletButton connectWallet={connectWallet} /> :
        correctNetwork ? <TodoList tasks={tasks} addTask={addTask} setInput={setInput} input={input} deleteTask={deleteTask} /> : <WrongNetworkMessage />}
    </div>
  )

}