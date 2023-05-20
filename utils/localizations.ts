import { SurveyStatus } from "@prisma/client";

export const localizedSurveyStatus: { [key in SurveyStatus]: string } = {
    IN_DEVELOPMENT: 'В разработке',
    NOT_STARTED: 'Не начато',
    IN_PROGRESS: 'В процессе',
    FINISHED: 'Завершено'
}

export const localizeSurveyStatus = (status: SurveyStatus) => localizedSurveyStatus[status]
