pipeline {
   agent any

   stages {
      stage('Hello') {
         steps {
            echo 'Hello World'
         }
      }

      stage('Docker') {
         steps {
            sh 'docker ps -a'
            sh 'docker -v ~:/home:ro node:12-alpine ls home'
         }
      }
   }
}

