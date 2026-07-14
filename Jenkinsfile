pipeline {
    agent none

    stages {
        stage('Checkout') {
            agent any
            steps {
                checkout scm
            }
        }

        stage('Automated Tests') {
            parallel {
                stage('Python Tests') {
                    agent { docker { image 'python:3.12' } }
                    steps {
                        sh 'cd python-backend && pip install -r requirements.txt && pytest'
                    }
                }

                stage('JavaScript Tests') {
                    agent { docker { image 'node:20' } }
                    steps {
                        sh 'cd js-backend && npm ci --ignore-scripts && npm test'
                    }
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'python-backend/coverage.xml', allowEmptyArchive: true
            archiveArtifacts artifacts: 'js-backend/coverage/**', allowEmptyArchive: true
        }
    }
}
